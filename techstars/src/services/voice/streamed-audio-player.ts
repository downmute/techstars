import {
	AudioContext,
	type AudioBufferQueueSourceNode,
} from "react-native-audio-api";

export interface StreamedAudioPlayerOptions {
	sampleRate?: number;
	targetPeak?: number;
	maxGain?: number;
	outputBoost?: number;
	firstChunkPrerollMs?: number;
	firstChunkTrimSamples?: number;
	onActiveSourceCountChange?: (count: number) => void;
	onIdle?: () => void;
}

const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_TARGET_PEAK = 0.7;
const DEFAULT_MAX_GAIN = 12.0;
const DEFAULT_OUTPUT_BOOST = 2.5;
const DEFAULT_FIRST_CHUNK_PREROLL_MS = 45;
const DEFAULT_FIRST_CHUNK_TRIM_SAMPLES = 2880;

function createAudioBufferFromVector(
	audioContext: AudioContext,
	audioVector: Float32Array,
	sampleRate: number,
) {
	const audioBuffer = audioContext.createBuffer(1, audioVector.length, sampleRate);
	audioBuffer.getChannelData(0).set(audioVector);
	return audioBuffer;
}

export class StreamedAudioPlayer {
	private nextStartTime = 0;
	private activeSourceCount = 0;
	private chunkCount = 0;
	private source: AudioBufferQueueSourceNode | null = null;
	private sourceStarted = false;

	constructor(
		private readonly audioContext: AudioContext,
		private readonly options: StreamedAudioPlayerOptions = {},
	) {}

	private get sampleRate() {
		return this.options.sampleRate ?? DEFAULT_SAMPLE_RATE;
	}

	private notifyActiveSourceCountChange() {
		this.options.onActiveSourceCountChange?.(this.activeSourceCount);
	}

	getActiveSourceCount(): number {
		return this.activeSourceCount;
	}

	startUtterance(): void {
		this.chunkCount = 0;
		this.nextStartTime = 0;
		this.ensureSource();
	}

	reset(): void {
		this.nextStartTime = 0;
		this.chunkCount = 0;
	}

	stopAll(): void {
		if (this.source) {
			this.source.onEnded = null;
			try {
				this.source.clearBuffers();
			} catch {}
			try {
				this.source.stop();
			} catch {}
			try {
				this.source.disconnect();
			} catch {}
		}
		this.source = null;
		this.sourceStarted = false;
		this.activeSourceCount = 0;
		this.notifyActiveSourceCountChange();
		this.reset();
	}

	private ensureSource(): AudioBufferQueueSourceNode {
		if (this.source) {
			return this.source;
		}

		const source = this.audioContext.createBufferQueueSource();
		source.connect(this.audioContext.destination);
		source.onEnded = () => {
			this.source = null;
			this.sourceStarted = false;
			this.activeSourceCount = 0;
			this.notifyActiveSourceCountChange();
			this.options.onIdle?.();
		};
		this.source = source;
		this.activeSourceCount = 1;
		this.notifyActiveSourceCountChange();
		return source;
	}

	scheduleChunk(audioVec: Float32Array): AudioBufferQueueSourceNode | null {
		if (!audioVec || audioVec.length === 0) {
			return null;
		}

		this.chunkCount += 1;
		let inputVec = audioVec;
		if (this.chunkCount === 1) {
			const trimSamples =
				this.options.firstChunkTrimSamples ?? DEFAULT_FIRST_CHUNK_TRIM_SAMPLES;
			if (trimSamples > 0 && inputVec.length > trimSamples) {
				inputVec = inputVec.subarray(trimSamples);
			}
		}
		if (inputVec.length === 0) {
			return null;
		}

		let peak = 0;
		for (let i = 0; i < inputVec.length; i += 1) {
			const amplitude = Math.abs(inputVec[i] ?? 0);
			if (amplitude > peak) {
				peak = amplitude;
			}
		}

		const targetPeak = this.options.targetPeak ?? DEFAULT_TARGET_PEAK;
		const maxGain = this.options.maxGain ?? DEFAULT_MAX_GAIN;
		const outputBoost = this.options.outputBoost ?? DEFAULT_OUTPUT_BOOST;

		let gain = 1;
		if (peak > 0 && peak < targetPeak) {
			gain = Math.min(maxGain, targetPeak / peak);
		}

		const totalGain = gain * outputBoost;
		let playbackVec = inputVec;
		if (Math.abs(totalGain - 1) > 0.05) {
			playbackVec = new Float32Array(inputVec.length);
			for (let i = 0; i < inputVec.length; i += 1) {
				playbackVec[i] = Math.tanh((inputVec[i] ?? 0) * totalGain);
			}
		}

		const firstChunkPrerollMs =
			this.options.firstChunkPrerollMs ?? DEFAULT_FIRST_CHUNK_PREROLL_MS;
		if (this.chunkCount === 1 && firstChunkPrerollMs > 0) {
			const prerollSamples = Math.max(
				1,
				Math.round((firstChunkPrerollMs / 1000) * this.sampleRate),
			);
			const padded = new Float32Array(prerollSamples + playbackVec.length);
			padded.set(playbackVec, prerollSamples);
			playbackVec = padded;
		}

		const audioBuffer = createAudioBufferFromVector(
			this.audioContext,
			playbackVec,
			this.sampleRate,
		);
		const source = this.ensureSource();
		source.enqueueBuffer(audioBuffer);

		if (!this.sourceStarted) {
			const currentTime = this.audioContext.currentTime;
			if (this.nextStartTime < currentTime) {
				this.nextStartTime = currentTime;
			}
			source.start(this.nextStartTime);
			this.sourceStarted = true;
		}
		this.nextStartTime += audioBuffer.duration;

		return source;
	}
}
