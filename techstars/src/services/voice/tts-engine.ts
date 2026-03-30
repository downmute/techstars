/**
 * TTS Engine
 *
 * Primary: PocketTTS via onnxruntime-react-native
 * Fallback: expo-speech
 */

import {
	type AudioPlayer,
	type AudioStatus,
	createAudioPlayer,
	setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";
import { AudioContext, AudioManager } from "react-native-audio-api";

import { getModelPath } from "@/services/models/model-registry";
import {
	initPocketTTSRuntime,
	isPocketTTSReady,
	synthesizeWithPocketTTSStream,
	synthesizeWithPocketTTS,
} from "./pocket-tts-runtime";
import {
	encodeBase64FromBytes,
	estimateAmplitudeFrames,
	float32ToWavBytes,
	TTS_SAMPLE_RATE,
} from "./wav-utils";
import { StreamedAudioPlayer } from "./streamed-audio-player";

export type AmplitudeCallback = (amplitude: number) => void;
const POCKET_TTS_SYNTH_TIMEOUT_MS = 20000;
const POCKET_TTS_WARMUP_TRIM_SAMPLES = 2880;
const POCKET_TTS_TARGET_PEAK = 0.82;
const POCKET_TTS_MAX_GAIN = 8;
const STREAM_FIRST_PLAYBACK_BUFFER_SAMPLES = Math.floor(TTS_SAMPLE_RATE * 0.85);
const STREAM_NORMAL_PLAYBACK_BUFFER_SAMPLES = Math.floor(TTS_SAMPLE_RATE * 1.1);

let pocketTTSAvailable = false;
let activePlayer: AudioPlayer | null = null;
let activeSubscription: { remove(): void } | null = null;
let activeAmplitudeInterval: ReturnType<typeof setInterval> | null = null;
let activeTempFile: string | null = null;
let pocketTTSWarmPromise: Promise<void> | null = null;
let pocketTTSWarmed = false;
let initTTSPromise: Promise<void> | null = null;
let playbackInstanceCounter = 0;
let streamedAudioContext: AudioContext | null = null;
let streamedAudioPlayer: StreamedAudioPlayer | null = null;
let streamedAudioPlayerPromise: Promise<StreamedAudioPlayer> | null = null;
let streamedPlaybackIdleResolver: (() => void) | null = null;

function formatPlaybackStatus(status: AudioStatus): string {
	return [
		`loaded=${String(status.isLoaded)}`,
		`playing=${String(status.playing)}`,
		`buffering=${String(status.isBuffering)}`,
		`didJustFinish=${String(status.didJustFinish)}`,
		`time=${status.currentTime.toFixed(2)}/${status.duration.toFixed(2)}`,
		`state=${status.playbackState}`,
		`control=${status.timeControlStatus}`,
		`wait=${status.reasonForWaitingToPlay || "none"}`,
		status.mediaServicesDidReset ? "mediaReset=true" : null,
	]
		.filter(Boolean)
		.join(" ");
}

function getAudioStats(audio: Float32Array): {
	peak: number;
	rms: number;
} {
	if (audio.length === 0) {
		return { peak: 0, rms: 0 };
	}

	let peak = 0;
	let sumSquares = 0;
	for (let i = 0; i < audio.length; i += 1) {
		const sample = audio[i] ?? 0;
		const abs = Math.abs(sample);
		if (abs > peak) {
			peak = abs;
		}
		sumSquares += sample * sample;
	}

	return {
		peak,
		rms: Math.sqrt(sumSquares / audio.length),
	};
}

function concatenateAudioChunks(chunks: Float32Array[]): Float32Array {
	if (chunks.length === 0) {
		return new Float32Array(0);
	}

	const totalSamples = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const merged = new Float32Array(totalSamples);
	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.length;
	}
	return merged;
}

function preparePocketTtsAudio(
	audio: Float32Array,
	options: { trimWarmup?: boolean } = {},
): Float32Array {
	const shouldTrimWarmup = options.trimWarmup ?? true;
	const trimSamples = shouldTrimWarmup
		? Math.min(audio.length, POCKET_TTS_WARMUP_TRIM_SAMPLES)
		: 0;
	const trimmed = trimSamples > 0 ? audio.subarray(trimSamples) : audio;

	const before = getAudioStats(trimmed);
	if (trimmed.length === 0 || before.peak <= 0) {
		console.log(
			`[PocketTTS] audio stats pre peak=${before.peak.toFixed(4)} rms=${before.rms.toFixed(4)} trimSamples=${Math.min(
				audio.length,
				trimSamples,
			)} gain=1.00`,
		);
		return trimmed;
	}

	const gain = Math.min(POCKET_TTS_MAX_GAIN, POCKET_TTS_TARGET_PEAK / before.peak);
	const prepared =
		gain > 1.05 ? new Float32Array(trimmed.length) : new Float32Array(trimmed);

	if (gain > 1.05) {
		for (let i = 0; i < trimmed.length; i += 1) {
			const boosted = (trimmed[i] ?? 0) * gain;
			prepared[i] = Math.max(-1, Math.min(1, boosted));
		}
	}

	const after = getAudioStats(prepared);
	console.log(
		`[PocketTTS] audio stats pre peak=${before.peak.toFixed(4)} rms=${before.rms.toFixed(4)} post peak=${after.peak.toFixed(4)} rms=${after.rms.toFixed(4)} trimSamples=${Math.min(
			audio.length,
			trimSamples,
		)} gain=${gain.toFixed(2)}`,
	);

	return prepared;
}

async function checkPocketTTSModels(): Promise<boolean> {
	const required = [
		"text_conditioner.onnx",
		"flow_lm_main.onnx",
		"flow_lm_flow.onnx",
		"mimi_decoder.onnx",
		"mimi_encoder.onnx",
		"tokenizer.model",
		"reference_sample.wav",
	];

	for (const filename of required) {
		const info = await FileSystem.getInfoAsync(getModelPath(filename));
		if (!info.exists) {
			return false;
		}
	}

	return true;
}

async function ensurePocketTTSAvailable(): Promise<boolean> {
	if (pocketTTSAvailable || isPocketTTSReady()) {
		pocketTTSAvailable = true;
		return true;
	}

	const modelsPresent = await checkPocketTTSModels();
	if (!modelsPresent) {
		pocketTTSAvailable = false;
		return false;
	}

	pocketTTSAvailable = await initPocketTTSRuntime();
	return pocketTTSAvailable;
}

async function warmPocketTTSIfNeeded(): Promise<void> {
	if (!pocketTTSAvailable && !isPocketTTSReady()) {
		return;
	}
	if (pocketTTSWarmed) {
		return;
	}
	if (pocketTTSWarmPromise) {
		return pocketTTSWarmPromise;
	}

	pocketTTSWarmPromise = (async () => {
		try {
			console.log("[PocketTTS] warmup start");
			const warmAudio = await synthesizePocketTTSWithTimeout("Okay.");
			preparePocketTtsAudio(warmAudio);
			pocketTTSWarmed = true;
			console.log("[PocketTTS] warmup complete");
		} catch (error) {
			console.warn("[PocketTTS] warmup failed:", error);
		} finally {
			pocketTTSWarmPromise = null;
		}
	})();

	return pocketTTSWarmPromise;
}

function clearPlaybackState() {
	if (activeAmplitudeInterval) {
		clearInterval(activeAmplitudeInterval);
		activeAmplitudeInterval = null;
	}
	activeSubscription?.remove();
	activeSubscription = null;
	if (activePlayer) {
		try {
			activePlayer.pause();
		} catch {}
		try {
			activePlayer.remove();
		} catch {}
		activePlayer = null;
	}
}

async function cleanupTempFile() {
	if (!activeTempFile) {
		return;
	}
	const file = activeTempFile;
	activeTempFile = null;
	try {
		await FileSystem.deleteAsync(file, { idempotent: true });
	} catch {}
}

async function ensurePlaybackAudioMode(): Promise<void> {
	console.log("[PocketTTS] playback setting audio mode");
	await setAudioModeAsync({
		allowsRecording: false,
		playsInSilentMode: true,
		interruptionMode: "doNotMix",
	});
	AudioManager.setAudioSessionOptions({
		iosCategory: "playAndRecord",
		iosMode: "spokenAudio",
		iosOptions: [
			"defaultToSpeaker",
			"duckOthers",
			"allowBluetoothA2DP",
			"allowBluetoothHFP",
		],
	});
	await AudioManager.setAudioSessionActivity(true);
	console.log("[PocketTTS] playback audio mode ready");
}

async function ensureStreamedAudioPlayer(): Promise<StreamedAudioPlayer> {
	if (
		streamedAudioPlayer &&
		streamedAudioContext &&
		streamedAudioContext.state !== "closed"
	) {
		if (streamedAudioContext.state !== "running") {
			await streamedAudioContext.resume();
		}
		return streamedAudioPlayer;
	}
	if (streamedAudioPlayerPromise) {
		return streamedAudioPlayerPromise;
	}

	streamedAudioPlayerPromise = (async () => {
		const context = new AudioContext({ sampleRate: TTS_SAMPLE_RATE });
		if (context.state !== "running") {
			const resumed = await context.resume();
			console.log(`[PocketTTS] stream context resumed=${String(resumed)}`);
		}
		streamedAudioContext = context;
		streamedAudioPlayer = new StreamedAudioPlayer(context, {
			sampleRate: TTS_SAMPLE_RATE,
			onActiveSourceCountChange: (count) => {
				console.log(`[PocketTTS] stream activeSources=${count}`);
			},
			onIdle: () => {
				const resolve = streamedPlaybackIdleResolver;
				streamedPlaybackIdleResolver = null;
				resolve?.();
			},
		});
		return streamedAudioPlayer;
	})().finally(() => {
		streamedAudioPlayerPromise = null;
	});

	return streamedAudioPlayerPromise;
}

export async function resetStreamedPlaybackRoute(): Promise<void> {
	streamedPlaybackIdleResolver?.();
	streamedPlaybackIdleResolver = null;

	try {
		streamedAudioPlayer?.stopAll();
	} catch {}

	const context = streamedAudioContext;
	streamedAudioPlayer = null;
	streamedAudioContext = null;
	streamedAudioPlayerPromise = null;

	if (!context || context.state === "closed") {
		return;
	}

	try {
		await context.close();
		console.log("[PocketTTS] stream context closed");
	} catch (error) {
		console.warn("[PocketTTS] failed to close stream context:", error);
	}
}

export async function initTTS(): Promise<void> {
	if (pocketTTSWarmed && (pocketTTSAvailable || isPocketTTSReady())) {
		return;
	}
	if (initTTSPromise) {
		return initTTSPromise;
	}

	initTTSPromise = (async () => {
		pocketTTSAvailable = await ensurePocketTTSAvailable();
		if (pocketTTSAvailable) {
			await warmPocketTTSIfNeeded();
		}
	})().finally(() => {
		initTTSPromise = null;
	});

	return initTTSPromise;
}

function simulateAmplitude(
	durationEstimateMs: number,
	onAmplitude: AmplitudeCallback,
): ReturnType<typeof setInterval> {
	const fps = 30;
	const intervalMs = 1000 / fps;
	let elapsed = 0;
	const rampUpMs = 200;
	const rampDownMs = 300;

	return setInterval(() => {
		elapsed += intervalMs;
		let amplitude = 0;

		if (elapsed < rampUpMs) {
			amplitude = elapsed / rampUpMs;
		} else if (elapsed > durationEstimateMs - rampDownMs) {
			const remaining = durationEstimateMs - elapsed;
			amplitude = Math.max(0, remaining / rampDownMs);
		} else {
			amplitude =
				0.7 + 0.3 * Math.sin((elapsed / durationEstimateMs) * Math.PI * 4);
		}

		onAmplitude(Math.max(0, Math.min(1, amplitude)));
	}, intervalMs);
}

function startAmplitudePlayback(
	audio: Float32Array,
	onAmplitude?: AmplitudeCallback,
): void {
	if (!onAmplitude) {
		return;
	}
	if (activeAmplitudeInterval) {
		clearInterval(activeAmplitudeInterval);
		activeAmplitudeInterval = null;
	}

	const amplitudes = estimateAmplitudeFrames(audio, 1024);
	if (amplitudes.length === 0) {
		onAmplitude(0);
		return;
	}

	let index = 0;
	const intervalMs = Math.max(
		24,
		Math.round((audio.length / TTS_SAMPLE_RATE / amplitudes.length) * 1000),
	);

	activeAmplitudeInterval = setInterval(() => {
		if (index >= amplitudes.length) {
			onAmplitude(0);
			if (activeAmplitudeInterval) {
				clearInterval(activeAmplitudeInterval);
				activeAmplitudeInterval = null;
			}
			return;
		}

		onAmplitude(amplitudes[index]!);
		index += 1;
	}, intervalMs);
}

async function playPocketTTS(
	audio: Float32Array,
	onAmplitude?: AmplitudeCallback,
): Promise<void> {
	clearPlaybackState();
	await cleanupTempFile();

	const estimatedDurationMs = Math.ceil(
		(audio.length / TTS_SAMPLE_RATE) * 1000,
	);
	console.log(
		`[PocketTTS] playback prepare samples=${audio.length} durationMs=${estimatedDurationMs}`,
	);

	await ensurePlaybackAudioMode();

	const wavBytes = float32ToWavBytes(audio, TTS_SAMPLE_RATE);
	const tempFile = `${FileSystem.cacheDirectory}vela_tts_${Date.now()}.wav`;
	await FileSystem.writeAsStringAsync(
		tempFile,
		encodeBase64FromBytes(wavBytes),
		{ encoding: FileSystem.EncodingType.Base64 },
	);
	activeTempFile = tempFile;
	console.log(
		`[PocketTTS] playback wav written path=${tempFile} bytes=${wavBytes.length}`,
	);

	startAmplitudePlayback(audio, onAmplitude);

	await new Promise<void>((resolve, reject) => {
		let settled = false;
		let playbackFallbackTimer: ReturnType<typeof setTimeout> | null = null;
		let playbackStartupTimer: ReturnType<typeof setTimeout> | null = null;
		let statusUpdateCount = 0;
		let lastStatusFingerprint = "";
		const playerId = ++playbackInstanceCounter;
		const finish = (reason: string, error?: Error) => {
			if (settled) {
				return;
			}
			settled = true;
			if (playbackFallbackTimer) {
				clearTimeout(playbackFallbackTimer);
				playbackFallbackTimer = null;
			}
			if (playbackStartupTimer) {
				clearTimeout(playbackStartupTimer);
				playbackStartupTimer = null;
			}
			if (activeAmplitudeInterval) {
				clearInterval(activeAmplitudeInterval);
				activeAmplitudeInterval = null;
			}
			onAmplitude?.(0);
			console.log(
				error
					? `[PocketTTS] playback end player=${playerId} reason=${reason} updates=${statusUpdateCount} error=${error.message}`
					: `[PocketTTS] playback end player=${playerId} reason=${reason} updates=${statusUpdateCount}`,
			);
			clearPlaybackState();
			void cleanupTempFile();
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		};

		try {
			const fallbackMs = Math.max(1200, estimatedDurationMs + 600);
			console.log(
				`[PocketTTS] playback creating player=${playerId} updateInterval=100 fallbackMs=${fallbackMs}`,
			);
			const player = createAudioPlayer(
				{ uri: tempFile },
				{ updateInterval: 100, keepAudioSessionActive: true },
			);
			activePlayer = player;
			playbackFallbackTimer = setTimeout(() => {
				console.warn(
					"[PocketTTS] playback finish event timed out, resolving via fallback",
				);
				finish("finish-timeout");
			}, fallbackMs);
			playbackStartupTimer = setTimeout(() => {
				console.warn(
					"[PocketTTS] playback startup timed out waiting for status update",
				);
			}, 1500);
			activeSubscription = player.addListener(
				"playbackStatusUpdate",
				(status: AudioStatus) => {
					statusUpdateCount += 1;
					const fingerprint = [
						status.isLoaded,
						status.playing,
						status.isBuffering,
						status.didJustFinish,
						status.playbackState,
						status.timeControlStatus,
						status.reasonForWaitingToPlay,
						Math.round(status.currentTime * 10),
						Math.round(status.duration * 10),
						status.mediaServicesDidReset ? "reset" : "",
					].join("|");
					if (playbackStartupTimer) {
						clearTimeout(playbackStartupTimer);
						playbackStartupTimer = null;
					}
					if (
						statusUpdateCount <= 8 ||
						fingerprint !== lastStatusFingerprint ||
						status.didJustFinish
					) {
						console.log(
							`[PocketTTS] playback status player=${playerId} #${statusUpdateCount} ${formatPlaybackStatus(status)}`,
						);
						lastStatusFingerprint = fingerprint;
					}
					if (status.didJustFinish) {
						finish("didJustFinish");
					}
				},
			);
			console.log("[PocketTTS] playback calling play()");
			player.play();
			console.log("[PocketTTS] playback play() returned");
		} catch (error) {
			finish(
				"play-error",
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	});
}

async function synthesizePocketTTSWithTimeout(
	text: string,
): Promise<Float32Array> {
	return Promise.race([
		synthesizeWithPocketTTS(text),
		new Promise<Float32Array>((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						`PocketTTS synthesis timed out after ${Math.round(
							POCKET_TTS_SYNTH_TIMEOUT_MS / 1000,
						)}s`,
					),
				);
			}, POCKET_TTS_SYNTH_TIMEOUT_MS);
		}),
	]);
}

export async function synthesizeSpeechAudio(
	text: string,
): Promise<Float32Array | null> {
	const localReady =
		pocketTTSAvailable ||
		isPocketTTSReady() ||
		(await ensurePocketTTSAvailable());

	if (!localReady) {
		return null;
	}

	await warmPocketTTSIfNeeded();
	console.log(`[PocketTTS] synthesis start chars=${text.length}`);
	const rawAudio = await synthesizePocketTTSWithTimeout(text);
	console.log(`[PocketTTS] synthesis complete samples=${rawAudio.length}`);
	const preparedAudio = preparePocketTtsAudio(rawAudio);
	return preparedAudio.length > 0 ? preparedAudio : null;
}

export async function playSpeechAudio(
	audio: Float32Array,
	onAmplitude?: AmplitudeCallback,
): Promise<void> {
	await playPocketTTS(audio, onAmplitude);
}

export async function speakStreaming(
	text: string,
	onAmplitude?: AmplitudeCallback,
): Promise<void> {
	await speak(text, onAmplitude);
}

export async function speak(
	text: string,
	onAmplitude?: AmplitudeCallback,
): Promise<void> {
	try {
		const preparedAudio = await synthesizeSpeechAudio(text);
		if (preparedAudio) {
			await playPocketTTS(preparedAudio, onAmplitude);
			return;
		}
	} catch (error) {
		try {
			console.warn(
				"[PocketTTS] synthesis failed, falling back to expo-speech:",
				error,
			);
		} catch {}
	}

	const estimatedMs = Math.max(1500, text.length * 55);
	let amplitudeInterval: ReturnType<typeof setInterval> | null = null;

	return new Promise((resolve, reject) => {
		if (onAmplitude) {
			amplitudeInterval = simulateAmplitude(estimatedMs, onAmplitude);
		}

		Speech.speak(text, {
			rate: 0.85,
			pitch: 1,
			onDone: () => {
				if (amplitudeInterval) {
					clearInterval(amplitudeInterval);
				}
				onAmplitude?.(0);
				resolve();
			},
			onError: (error: Error) => {
				if (amplitudeInterval) {
					clearInterval(amplitudeInterval);
				}
				onAmplitude?.(0);
				reject(error);
			},
			onStopped: () => {
				if (amplitudeInterval) {
					clearInterval(amplitudeInterval);
				}
				onAmplitude?.(0);
				resolve();
			},
		});
	});
}

export function stopSpeaking(): void {
	Speech.stop();
	streamedPlaybackIdleResolver?.();
	streamedPlaybackIdleResolver = null;
	streamedAudioPlayer?.stopAll();
	clearPlaybackState();
	void cleanupTempFile();
}

export function isSpeechAvailable(): boolean {
	return true;
}
