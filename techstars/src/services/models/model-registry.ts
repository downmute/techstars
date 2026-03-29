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

// Parakeet runtime assets mirrored from the working on-device implementation.
// We use the ONNX ASR split-model export so JS can handle mel features/greedy decode locally.
const PARAKEET_BASE =
  'https://huggingface.co/ysdede/parakeet-tdt-0.6b-v2-onnx/resolve/main';

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
    sizeMb: 0.5,
    description: 'PocketTTS tokenizer',
  },
  {
    key: 'tts_reference_voice',
    filename: 'reference_sample.wav',
    url: `${HF_BASE}/reference_sample.wav`,
    sizeMb: 0.2,
    description: 'PocketTTS reference voice',
  },
  {
    key: 'stt_parakeet_encoder',
    filename: 'encoder-model.int8.onnx',
    url: `${PARAKEET_BASE}/encoder-model.int8.onnx`,
    sizeMb: 652,
    description: 'Parakeet encoder',
  },
  {
    key: 'stt_parakeet_decoder',
    filename: 'decoder_joint-model.int8.onnx',
    url: `${PARAKEET_BASE}/decoder_joint-model.int8.onnx`,
    sizeMb: 9.3,
    description: 'Parakeet decoder',
  },
  {
    key: 'stt_parakeet_vocab',
    filename: 'vocab.txt',
    url: `${PARAKEET_BASE}/vocab.txt`,
    sizeMb: 0.1,
    description: 'Parakeet vocabulary',
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
