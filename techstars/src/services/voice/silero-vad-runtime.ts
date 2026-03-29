import * as FileSystem from "expo-file-system/legacy";
import {
	InferenceSession as OrtSession,
	Tensor as OrtTensor,
} from "onnxruntime-react-native";

import { getModelPath } from "@/services/models/model-registry";
import { STT_SAMPLE_RATE } from "./wav-utils";

const SILERO_MODEL_FILENAME = "silero_vad_16k_op15.onnx";
const SILERO_WINDOW_SAMPLES = 512;
const SILERO_CONTEXT_SAMPLES = 64;
const SPEECH_THRESHOLD = 0.42;
const NEGATIVE_SPEECH_THRESHOLD = 0.25;
const SPEECH_START_FRAMES = 1;
const SPEECH_END_FRAMES = 10;

interface OnnxInputMeta {
	name: string;
	dims: number[];
	elemType: "float32" | "int64" | "bool";
}

export interface SileroVadFrameResult {
	sampleIndex: number;
	speechProbability: number;
	isSpeech: boolean;
	speechStarted: boolean;
	speechEnded: boolean;
}

function normalizeSessionInputMetas(
	metadata: readonly {
		name: string;
		isTensor: boolean;
		type?: string;
		shape?: readonly (number | string)[];
	}[],
): OnnxInputMeta[] {
	const metas: OnnxInputMeta[] = [];

	for (const meta of metadata) {
		if (!meta.isTensor) {
			continue;
		}

		const elemType: OnnxInputMeta["elemType"] =
			meta.type === "int64"
				? "int64"
				: meta.type === "bool"
					? "bool"
					: "float32";

		metas.push({
			name: meta.name,
			elemType,
			dims: (meta.shape ?? []).map((dim) =>
				typeof dim === "number" && Number.isFinite(dim) && dim >= 0 ? dim : 0,
			),
		});
	}

	return metas;
}

function resolveDims(dims: number[], fallback: readonly number[]): number[] {
	return dims.map((dim, index) => {
		if (dim > 0) {
			return dim;
		}
		return fallback[index] ?? 1;
	});
}

function disposeTensor(tensor: unknown): void {
	if (
		tensor &&
		typeof tensor === "object" &&
		"dispose" in tensor &&
		typeof (tensor as { dispose?: unknown }).dispose === "function"
	) {
		try {
			(tensor as { dispose: () => void }).dispose();
		} catch {}
	}
}

class SileroVadRuntime {
	readonly inputName: string;
	readonly stateInputName: string;
	readonly sampleRateInputName: string;
	readonly outputName: string;
	readonly stateOutputName: string;
	readonly stateDims: number[];
	readonly sampleRateDims: number[];
	readonly sampleRateType: "float32" | "int64" | "bool";

	constructor(readonly session: OrtSession) {
		const metas = normalizeSessionInputMetas(
			(session.inputMetadata as Parameters<
				typeof normalizeSessionInputMetas
			>[0]) ?? [],
		);

		const inputMeta =
			metas.find((meta) => meta.name === "input") ??
			metas.find(
				(meta) => meta.elemType === "float32" && !meta.name.includes("state"),
			) ??
			metas[0];
		const stateMeta =
			metas.find((meta) => meta.name === "state") ??
			metas.find((meta) => meta.name.includes("state")) ??
			metas[1];
		const sampleRateMeta =
			metas.find((meta) => meta.name === "sr") ??
			metas.find((meta) => meta.elemType === "int64") ??
			metas[2];

		if (!inputMeta || !stateMeta || !sampleRateMeta) {
			throw new Error("Silero VAD input metadata is incomplete");
		}

		this.inputName = inputMeta.name;
		this.stateInputName = stateMeta.name;
		this.sampleRateInputName = sampleRateMeta.name;
		this.outputName = session.outputNames.includes("output")
			? "output"
			: session.outputNames[0]!;
		this.stateOutputName = session.outputNames.includes("stateN")
			? "stateN"
			: (session.outputNames.find((name) =>
					name.toLowerCase().includes("state"),
				) ?? session.outputNames[1]!);
		this.stateDims = resolveDims(stateMeta.dims, [2, 1, 128]);
		this.sampleRateDims = resolveDims(sampleRateMeta.dims, [1]);
		this.sampleRateType = sampleRateMeta.elemType;
	}

	createInitialStateTensor(): OrtTensor {
		const elementCount = this.stateDims.reduce((acc, dim) => acc * dim, 1);
		return new OrtTensor(
			"float32",
			new Float32Array(elementCount),
			this.stateDims,
		);
	}

	createSampleRateTensor(): OrtTensor {
		if (this.sampleRateType === "int64") {
			return new OrtTensor(
				"int64",
				BigInt64Array.from([BigInt(STT_SAMPLE_RATE)]),
				this.sampleRateDims,
			);
		}

		return new OrtTensor(
			"float32",
			Float32Array.from([STT_SAMPLE_RATE]),
			this.sampleRateDims,
		);
	}

	dispose(): void {
		try {
			this.session.release();
		} catch {}
	}
}

export class SileroVadStream {
	private state: OrtTensor;
	private readonly sampleRateTensor: OrtTensor;
	private context = new Float32Array(SILERO_CONTEXT_SAMPLES);
	private residual = new Float32Array(0);
	private sampleCursor = 0;
	private triggered = false;
	private speechFrameStreak = 0;
	private silenceFrameStreak = 0;

	constructor(private readonly runtime: SileroVadRuntime) {
		this.state = runtime.createInitialStateTensor();
		this.sampleRateTensor = runtime.createSampleRateTensor();
	}

	reset(): void {
		disposeTensor(this.state);
		this.state = this.runtime.createInitialStateTensor();
		this.context = new Float32Array(SILERO_CONTEXT_SAMPLES);
		this.residual = new Float32Array(0);
		this.sampleCursor = 0;
		this.triggered = false;
		this.speechFrameStreak = 0;
		this.silenceFrameStreak = 0;
	}

	dispose(): void {
		disposeTensor(this.state);
		disposeTensor(this.sampleRateTensor);
	}

	async pushAudio(chunk: Float32Array): Promise<SileroVadFrameResult[]> {
		if (chunk.length === 0) {
			return [];
		}

		const merged = new Float32Array(this.residual.length + chunk.length);
		merged.set(this.residual, 0);
		merged.set(chunk, this.residual.length);

		const results: SileroVadFrameResult[] = [];
		let offset = 0;

		while (offset + SILERO_WINDOW_SAMPLES <= merged.length) {
			const frame = merged.subarray(offset, offset + SILERO_WINDOW_SAMPLES);
			results.push(await this.processFrame(frame));
			offset += SILERO_WINDOW_SAMPLES;
		}

		this.residual = merged.slice(offset);
		return results;
	}

	private async processFrame(
		frame: Float32Array,
	): Promise<SileroVadFrameResult> {
		const inputData = new Float32Array(
			SILERO_CONTEXT_SAMPLES + SILERO_WINDOW_SAMPLES,
		);
		inputData.set(this.context, 0);
		inputData.set(frame, SILERO_CONTEXT_SAMPLES);

		const inputTensor = new OrtTensor("float32", inputData, [
			1,
			inputData.length,
		]);

		let outputs: Record<string, OrtTensor> | null = null;
		let probabilityTensor: OrtTensor | null = null;
		let nextState: OrtTensor | null = null;

		try {
			outputs = (await this.runtime.session.run({
				[this.runtime.inputName]: inputTensor,
				[this.runtime.stateInputName]: this.state,
				[this.runtime.sampleRateInputName]: this.sampleRateTensor,
			})) as Record<string, OrtTensor>;

			probabilityTensor =
				outputs[this.runtime.outputName] ??
				outputs[this.runtime.session.outputNames[0]!]!;
			nextState =
				outputs[this.runtime.stateOutputName] ??
				outputs[this.runtime.session.outputNames[1]!]!;

			const probability = Number(
				(probabilityTensor.data as Float32Array | number[])[0] ?? 0,
			);

			const previousState = this.state;
			this.state = nextState;
			nextState = null;
			disposeTensor(previousState);

			this.context = frame.slice(frame.length - SILERO_CONTEXT_SAMPLES);
			this.sampleCursor += frame.length;

			let speechStarted = false;
			let speechEnded = false;

			if (probability >= SPEECH_THRESHOLD) {
				this.speechFrameStreak += 1;
				this.silenceFrameStreak = 0;
			} else if (probability < NEGATIVE_SPEECH_THRESHOLD) {
				this.silenceFrameStreak += 1;
				this.speechFrameStreak = 0;
			}

			if (!this.triggered && this.speechFrameStreak >= SPEECH_START_FRAMES) {
				this.triggered = true;
				this.speechFrameStreak = 0;
				this.silenceFrameStreak = 0;
				speechStarted = true;
			} else if (
				this.triggered &&
				this.silenceFrameStreak >= SPEECH_END_FRAMES
			) {
				this.triggered = false;
				this.speechFrameStreak = 0;
				this.silenceFrameStreak = 0;
				speechEnded = true;
			}

			return {
				sampleIndex: this.sampleCursor,
				speechProbability: probability,
				isSpeech: this.triggered || probability >= SPEECH_THRESHOLD,
				speechStarted,
				speechEnded,
			};
		} finally {
			disposeTensor(inputTensor);
			if (outputs) {
				for (const value of Object.values(outputs)) {
					if (value !== probabilityTensor && value !== this.state) {
						disposeTensor(value);
					}
				}
			}
			if (probabilityTensor && probabilityTensor !== this.state) {
				disposeTensor(probabilityTensor);
			}
			if (nextState) {
				disposeTensor(nextState);
			}
		}
	}
}

let runtime: SileroVadRuntime | null = null;
let initPromise: Promise<boolean> | null = null;

export async function initSileroVadRuntime(): Promise<boolean> {
	if (runtime) {
		console.log("[SileroVAD] runtime already ready");
		return true;
	}
	if (initPromise) {
		console.log("[SileroVAD] awaiting existing init");
		return initPromise;
	}

	initPromise = (async () => {
		try {
			console.log("[SileroVAD] init start");
			const modelPath = getModelPath(SILERO_MODEL_FILENAME);
			const info = await FileSystem.getInfoAsync(modelPath);
			if (!info.exists) {
				console.warn("[SileroVAD] required model missing");
				return false;
			}

			const session = await OrtSession.create(modelPath);
			runtime = new SileroVadRuntime(session);
			console.log(
				`[SileroVAD] init complete inputs=${runtime.session.inputNames.join(",")} outputs=${runtime.session.outputNames.join(",")}`,
			);
			return true;
		} catch (error) {
			console.warn("[SileroVAD] init failed:", error);
			runtime = null;
			return false;
		} finally {
			initPromise = null;
		}
	})();

	return initPromise;
}

export function isSileroVadReady(): boolean {
	return runtime !== null;
}

export function createSileroVadStream(): SileroVadStream {
	if (!runtime) {
		throw new Error("Silero VAD runtime is not ready");
	}
	return new SileroVadStream(runtime);
}

export function disposeSileroVadRuntime(): void {
	runtime?.dispose();
	runtime = null;
	initPromise = null;
}
