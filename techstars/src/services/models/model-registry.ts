import * as FileSystem from 'expo-file-system/legacy';

export interface ModelSpec {
  key: string;
  filename: string;
  url: string;
  sizeMb: number;
  description: string;
  expectedBytes?: number;
}

const MODELS_DIR = `${FileSystem.documentDirectory}vela_models/`;

// PocketTTS models from https://huggingface.co/KevinAHM/pocket-tts-onnx
// Using non-int8 versions as specified
const HF_BASE = 'https://huggingface.co/KevinAHM/pocket-tts-onnx/resolve/main';
const HF_ONNX_BASE = `${HF_BASE}/onnx`;

// Parakeet-Realtime EOU ONNX port of NVIDIA's intended streaming model.
// We use the split ONNX export so the existing JS/ORT pipeline can load it on-device.
const PARAKEET_BASE =
  'https://huggingface.co/ysdede/parakeet-realtime-eou-120m-v1-onnx/resolve/main';
const SILERO_VAD_BASE =
  'https://huggingface.co/istupakov/silero-vad-onnx/resolve/main';

export const MODEL_REGISTRY: ModelSpec[] = [
  {
    key: 'tts_text_conditioner',
    filename: 'text_conditioner.onnx',
    url: `${HF_ONNX_BASE}/text_conditioner.onnx`,
    sizeMb: 16.4,
    description: 'Voice text conditioner',
    expectedBytes: 16388363,
  },
  {
    key: 'tts_flow_lm_flow',
    filename: 'flow_lm_flow.onnx',
    url: `${HF_ONNX_BASE}/flow_lm_flow.onnx`,
    sizeMb: 39.1,
    description: 'Voice flow model',
    expectedBytes: 39097094,
  },
  {
    key: 'tts_mimi_decoder',
    filename: 'mimi_decoder.onnx',
    url: `${HF_ONNX_BASE}/mimi_decoder.onnx`,
    sizeMb: 41.5,
    description: 'Audio decoder',
    expectedBytes: 41471963,
  },
  {
    key: 'tts_mimi_encoder',
    filename: 'mimi_encoder.onnx',
    url: `${HF_ONNX_BASE}/mimi_encoder.onnx`,
    sizeMb: 73.2,
    description: 'Audio encoder',
    expectedBytes: 73165554,
  },
  {
    key: 'tts_flow_lm_main',
    filename: 'flow_lm_main.onnx',
    url: `${HF_ONNX_BASE}/flow_lm_main.onnx`,
    sizeMb: 303,
    description: 'Voice language model',
    expectedBytes: 302742542,
  },
  {
    key: 'tts_tokenizer',
    filename: 'tokenizer.model',
    url: `${HF_BASE}/tokenizer.model`,
    sizeMb: 0.06,
    description: 'PocketTTS tokenizer',
    expectedBytes: 59339,
  },
  {
    key: 'tts_reference_voice',
    filename: 'reference_sample.wav',
    url: `${HF_BASE}/reference_sample.wav`,
    sizeMb: 0.28,
    description: 'PocketTTS reference voice',
    expectedBytes: 286060,
  },
  {
    key: 'stt_parakeet_encoder',
    filename: 'encoder-model.int8.onnx',
    url: `${PARAKEET_BASE}/encoder-model.int8.onnx`,
    sizeMb: 131.5,
    description: 'Parakeet-Realtime encoder',
    expectedBytes: 131479377,
  },
  {
    key: 'stt_parakeet_decoder',
    filename: 'decoder_joint-model.int8.onnx',
    url: `${PARAKEET_BASE}/decoder_joint-model.int8.onnx`,
    sizeMb: 5.4,
    description: 'Parakeet-Realtime decoder',
    expectedBytes: 5368692,
  },
  {
    key: 'stt_parakeet_vocab',
    filename: 'vocab.txt',
    url: `${PARAKEET_BASE}/vocab.txt`,
    sizeMb: 0.01,
    description: 'Parakeet-Realtime vocabulary',
    expectedBytes: 6233,
  },
  {
    key: 'stt_parakeet_config',
    filename: 'config.json',
    url: `${PARAKEET_BASE}/config.json`,
    sizeMb: 0.001,
    description: 'Parakeet-Realtime config',
    expectedBytes: 320,
  },
  {
    key: 'vad_silero_model',
    filename: 'silero_vad_16k_op15.onnx',
    url: `${SILERO_VAD_BASE}/silero_vad_16k_op15.onnx`,
    sizeMb: 1.29,
    description: 'Silero VAD model',
    expectedBytes: 1289603,
  },
  {
    key: 'vad_silero_config',
    filename: 'silero_vad_config.json',
    url: `${SILERO_VAD_BASE}/config.json`,
    sizeMb: 0.001,
    description: 'Silero VAD config',
    expectedBytes: 30,
  },
];

export function getModelPath(filename: string): string {
  return `${MODELS_DIR}${filename}`;
}

export function getModelsDir(): string {
  return MODELS_DIR;
}

export const TOTAL_MODEL_MB = MODEL_REGISTRY.reduce(
  (sum, m) => sum + m.sizeMb,
  0
);
