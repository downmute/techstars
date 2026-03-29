/**
 * TTS Engine
 *
 * Primary: PocketTTS via onnxruntime-react-native
 * Fallback: expo-speech
 */

import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';

import { getModelPath } from '@/services/models/model-registry';
import {
  initPocketTTSRuntime,
  isPocketTTSReady,
  synthesizeWithPocketTTS,
} from './pocket-tts-runtime';
import {
  encodeBase64FromBytes,
  estimateAmplitudeFrames,
  float32ToWavBytes,
  TTS_SAMPLE_RATE,
} from './wav-utils';

export type AmplitudeCallback = (amplitude: number) => void;

let pocketTTSAvailable = false;
let activePlayer: AudioPlayer | null = null;
let activeSubscription: { remove(): void } | null = null;
let activeAmplitudeInterval: ReturnType<typeof setInterval> | null = null;
let activeTempFile: string | null = null;

async function checkPocketTTSModels(): Promise<boolean> {
  const required = [
    'text_conditioner.onnx',
    'flow_lm_main.onnx',
    'flow_lm_flow.onnx',
    'mimi_decoder.onnx',
    'mimi_encoder.onnx',
    'tokenizer.model',
    'reference_sample.wav',
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

export async function initTTS(): Promise<void> {
  pocketTTSAvailable = await ensurePocketTTSAvailable();
}

function simulateAmplitude(
  durationEstimateMs: number,
  onAmplitude: AmplitudeCallback
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
  onAmplitude?: AmplitudeCallback
): void {
  if (!onAmplitude) {
    return;
  }

  const amplitudes = estimateAmplitudeFrames(audio, 1024);
  if (amplitudes.length === 0) {
    onAmplitude(0);
    return;
  }

  let index = 0;
  const intervalMs = Math.max(
    24,
    Math.round((audio.length / TTS_SAMPLE_RATE / amplitudes.length) * 1000)
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
  onAmplitude?: AmplitudeCallback
): Promise<void> {
  clearPlaybackState();
  await cleanupTempFile();

  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  });

  const wavBytes = float32ToWavBytes(audio, TTS_SAMPLE_RATE);
  const tempFile = `${FileSystem.cacheDirectory}vela_tts_${Date.now()}.wav`;
  await FileSystem.writeAsStringAsync(
    tempFile,
    encodeBase64FromBytes(wavBytes),
    { encoding: FileSystem.EncodingType.Base64 }
  );
  activeTempFile = tempFile;

  startAmplitudePlayback(audio, onAmplitude);

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      if (activeAmplitudeInterval) {
        clearInterval(activeAmplitudeInterval);
        activeAmplitudeInterval = null;
      }
      onAmplitude?.(0);
      clearPlaybackState();
      void cleanupTempFile();
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    try {
      const player = createAudioPlayer({ uri: tempFile }, { updateInterval: 100 });
      activePlayer = player;
      activeSubscription = player.addListener(
        'playbackStatusUpdate',
        (status: AudioStatus) => {
          if (status.didJustFinish) {
            finish();
          }
        }
      );
      player.play();
    } catch (error) {
      finish(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export async function speak(
  text: string,
  onAmplitude?: AmplitudeCallback
): Promise<void> {
  const localReady =
    pocketTTSAvailable || isPocketTTSReady() || (await ensurePocketTTSAvailable());

  if (localReady) {
    try {
      const audio = await synthesizeWithPocketTTS(text);
      if (audio.length > 0) {
        await playPocketTTS(audio, onAmplitude);
        return;
      }
    } catch (error) {
      console.warn('[PocketTTS] synthesis failed, falling back to expo-speech:', error);
    }
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
  clearPlaybackState();
  void cleanupTempFile();
}

export function isSpeechAvailable(): boolean {
  return true;
}
