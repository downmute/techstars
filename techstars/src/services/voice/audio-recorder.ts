import {
	type AudioRecorder,
	IOSOutputFormat,
	type RecordingOptions,
	RecordingPresets,
	requestRecordingPermissionsAsync,
	setAudioModeAsync,
} from "expo-audio";
import AudioModule from "expo-audio/build/AudioModule";

export interface RecordingResult {
	uri: string;
	durationMs: number;
	metering?: number;
}

// Parakeet expects 16kHz mono PCM/WAV, so we start from Expo's preset and
// tighten the format to match the STT pipeline.
const RECORDING_OPTIONS: RecordingOptions = {
	...RecordingPresets.HIGH_QUALITY,
	isMeteringEnabled: true,
	extension: ".wav",
	sampleRate: 16000,
	numberOfChannels: 1,
	bitRate: 256000,
	android: {
		...RecordingPresets.HIGH_QUALITY.android,
		extension: ".wav",
		sampleRate: 16000,
		outputFormat: "default",
		audioEncoder: "default",
	},
	ios: {
		...RecordingPresets.HIGH_QUALITY.ios,
		extension: ".wav",
		outputFormat: IOSOutputFormat.LINEARPCM,
		sampleRate: 16000,
		linearPCMBitDepth: 16,
		linearPCMIsBigEndian: false,
		linearPCMIsFloat: false,
	},
	web: {
		...RecordingPresets.HIGH_QUALITY.web,
	},
};

let activeRecording: AudioRecorder | null = null;

async function enableRecordingMode(): Promise<void> {
	await setAudioModeAsync({
		allowsRecording: true,
		playsInSilentMode: true,
		interruptionMode: "doNotMix",
	});
}

async function restorePlaybackMode(): Promise<void> {
	await setAudioModeAsync({
		allowsRecording: false,
		playsInSilentMode: true,
		interruptionMode: "mixWithOthers",
	});
}

export async function startRecording(): Promise<void> {
	const permission = await requestRecordingPermissionsAsync();
	if (!permission.granted) {
		throw new Error("Microphone permission not granted");
	}

	await enableRecordingMode();

	const recording = new AudioModule.AudioRecorder(RECORDING_OPTIONS);
	await recording.prepareToRecordAsync();
	console.log("[Recorder] prepared");
	recording.record();
	console.log("[Recorder] started");
	activeRecording = recording;
}

export async function stopRecording(): Promise<RecordingResult> {
	if (!activeRecording) {
		throw new Error("No active recording");
	}

	const recording = activeRecording;
	await recording.stop();
	const status = recording.getStatus();
	const uri = recording.uri;
	activeRecording = null;
	await restorePlaybackMode();

	if (!uri) {
		throw new Error("Recording URI is null");
	}

	console.log(
		`[Recorder] stopped durationMs=${status.durationMillis ?? 0} metering=${
			typeof status.metering === "number" ? status.metering.toFixed(1) : "n/a"
		} uri=${uri}`,
	);

	return {
		uri,
		durationMs: status.durationMillis ?? 0,
		metering: typeof status.metering === "number" ? status.metering : undefined,
	};
}

export async function cancelRecording(): Promise<void> {
	if (!activeRecording) {
		return;
	}

	const recording = activeRecording;
	activeRecording = null;

	try {
		await recording.stop();
		console.log("[Recorder] cancelled");
	} catch {
		// Ignore stop failures during cancellation.
	}

	await restorePlaybackMode();
}

export function isRecording(): boolean {
	return activeRecording?.isRecording ?? false;
}
