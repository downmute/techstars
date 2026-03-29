/**
 * STT Engine
 *
 * Primary: Parakeet split ONNX runtime via onnxruntime-react-native
 * Fallback: Groq Whisper API (requires EXPO_PUBLIC_GROQ_API_KEY)
 *
 * The fallback is used automatically if:
 * - The Parakeet runtime assets are not found
 * - ONNX inference fails
 */

import {
	disposeParakeetRuntime,
	initParakeetRuntime,
	isParakeetReady,
	transcribeAudioBufferWithParakeetDetailed,
	transcribeWithParakeetDetailed,
} from "./parakeet-runtime";

const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

let onnxAvailable = false;

export interface STTResult {
	text: string;
	endOfUtterance: boolean;
	usedFallback: boolean;
}

async function tryLoadOnnxSession(): Promise<boolean> {
	try {
		const ready = await initParakeetRuntime();
		onnxAvailable = ready;
		return ready;
	} catch {
		onnxAvailable = false;
		return false;
	}
}

export async function initSTT(): Promise<boolean> {
	onnxAvailable = await tryLoadOnnxSession();
	return onnxAvailable;
}

export function resetSTT(): void {
	disposeParakeetRuntime();
	onnxAvailable = false;
}

async function transcribeWithGroqWhisper(audioUri: string): Promise<string> {
	const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
	if (!key) throw new Error("No Groq API key for Whisper fallback");

	const normalizedUri = audioUri.startsWith("file://")
		? audioUri
		: `file://${audioUri}`;

	const formData = new FormData();
	formData.append("file", {
		uri: normalizedUri,
		name: "audio.wav",
		type: "audio/wav",
	} as unknown as Blob);
	formData.append("model", "whisper-large-v3-turbo");
	formData.append("language", "en");
	formData.append("response_format", "json");

	const response = await fetch(GROQ_WHISPER_URL, {
		method: "POST",
		headers: { Authorization: `Bearer ${key}` },
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Whisper API error: ${response.status}`);
	}

	const data = (await response.json()) as { text: string };
	return data.text.trim();
}

function hasTerminalPunctuation(text: string): boolean {
	return /[.!?…]\s*$/.test(text.trim());
}

export async function transcribeDetailed(audioUri: string): Promise<STTResult> {
	const localReady = onnxAvailable || (await tryLoadOnnxSession());

	if (localReady) {
		try {
			const result = await transcribeWithParakeetDetailed(audioUri);
			if (result.text) {
				console.log(
					`[STT] local text="${result.text.slice(0, 120)}" eou=${String(result.sawEou)}`,
				);
			}
			return {
				text: result.text,
				endOfUtterance: result.sawEou || hasTerminalPunctuation(result.text),
				usedFallback: false,
			};
		} catch (error) {
			console.warn("[Parakeet] transcription failed, falling back:", error);
		}
	}

	const text = await transcribeWithGroqWhisper(audioUri);
	console.log(`[STT] fallback text="${text.slice(0, 120)}"`);
	return {
		text,
		endOfUtterance: hasTerminalPunctuation(text),
		usedFallback: true,
	};
}

export async function transcribeAudioBufferDetailed(
	audio: Float32Array,
): Promise<STTResult> {
	const localReady = onnxAvailable || (await tryLoadOnnxSession());
	if (!localReady) {
		throw new Error("Parakeet runtime is unavailable for live audio buffers");
	}

	const result = await transcribeAudioBufferWithParakeetDetailed(audio);
	if (result.text) {
		console.log(
			`[STT] live local text="${result.text.slice(0, 120)}" eou=${String(result.sawEou)}`,
		);
	}
	return {
		text: result.text,
		endOfUtterance: result.sawEou || hasTerminalPunctuation(result.text),
		usedFallback: false,
	};
}

export async function transcribe(audioUri: string): Promise<string> {
	const result = await transcribeDetailed(audioUri);
	return result.text;
}

export { isParakeetReady };
