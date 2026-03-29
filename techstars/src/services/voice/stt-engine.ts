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

import { initParakeetRuntime, isParakeetReady, transcribeWithParakeet } from './parakeet-runtime';
const GROQ_WHISPER_URL =
  'https://api.groq.com/openai/v1/audio/transcriptions';

let onnxAvailable = false;

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

export async function initSTT(): Promise<void> {
  onnxAvailable = await tryLoadOnnxSession();
}

async function transcribeWithGroqWhisper(audioUri: string): Promise<string> {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('No Groq API key for Whisper fallback');

  const normalizedUri = audioUri.startsWith('file://')
    ? audioUri
    : `file://${audioUri}`;

  const formData = new FormData();
  formData.append(
    'file',
    {
      uri: normalizedUri,
      name: 'audio.wav',
      type: 'audio/wav',
    } as unknown as Blob
  );
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const response = await fetch(GROQ_WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}

export async function transcribe(audioUri: string): Promise<string> {
  const localReady =
    onnxAvailable || isParakeetReady() || (await tryLoadOnnxSession());

  if (localReady) {
    try {
      const text = await transcribeWithParakeet(audioUri);
      if (text.trim().length > 0) {
        return text;
      }
    } catch {
      // Fall through to Groq Whisper
    }
  }

  return transcribeWithGroqWhisper(audioUri);
}

export { isParakeetReady };
