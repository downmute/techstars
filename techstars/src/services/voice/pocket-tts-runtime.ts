import * as FileSystem from 'expo-file-system/legacy';
import {
  InferenceSession as OrtSession,
  Tensor as OrtTensor,
} from 'onnxruntime-react-native';

import { getModelPath } from '@/services/models/model-registry';
import {
  encodeBase64FromBytes,
  parseWavToFloat32,
  readBinaryFile,
  TTS_SAMPLE_RATE,
} from './wav-utils';

const LSD_STEPS = 3;
const EOS_THRESHOLD = -4.0;
const FRAMES_AFTER_EOS = 3;
const MAX_FRAMES = 500;
const TEMPERATURE = 0.7;
const GAUSSIAN_STD = Math.sqrt(TEMPERATURE);

type OrtState = Record<string, OrtTensor>;

interface VoiceEmbedding {
  data: Float32Array;
  shape: [number, number, number];
}

interface OnnxInputMeta {
  name: string;
  dims: number[];
  elemType: 'float32' | 'int64' | 'bool';
}

interface SPPiece {
  piece: string;
  score: number;
  type: number;
}

interface VocabEntry {
  id: number;
  score: number;
}

interface RuntimeBundle {
  textConditioner: OrtSession;
  backbone: ONNXBackboneAdapter;
  flowNet: OrtSession;
  mimiDecoder: ONNXMimiDecoder;
  mimiEncoder: ONNXMimiEncoder;
  vocab: Map<string, VocabEntry>;
  unkId: number;
  maxPieceLen: number;
  voice: VoiceEmbedding;
}

class ONNXBackboneAdapter {
  private stateMetas: OnnxInputMeta[] = [];
  private state: OrtState = {};
  private textEmbName = 'text_embeddings';
  textEmbDim = 1024;
  private voiceEmbName: string | null = null;
  private voiceEmbDim = 0;
  private seqDim = 32;

  constructor(private readonly session: OrtSession) {}

  setAllInputMetas(metas: OnnxInputMeta[]) {
    this.stateMetas = metas.filter((meta) => meta.name.startsWith('state_'));

    for (const meta of metas) {
      if (meta.name.startsWith('state_')) {
        continue;
      }
      if (meta.name === 'sequence') {
        this.seqDim = meta.dims[meta.dims.length - 1] ?? 32;
      } else if (meta.name === 'text_embeddings' || meta.name.includes('text')) {
        this.textEmbName = meta.name;
        this.textEmbDim = meta.dims[meta.dims.length - 1] ?? 1024;
      } else if (meta.elemType === 'float32') {
        this.voiceEmbName = meta.name;
        this.voiceEmbDim = meta.dims[meta.dims.length - 1] ?? 0;
      }
    }
  }

  reset() {
    this.state = {};
    for (const { name, dims, elemType } of this.stateMetas) {
      const count = dims.reduce((acc, dim) => acc * Math.max(1, dim), 1);
      this.state[name] =
        elemType === 'int64'
          ? new OrtTensor('int64', new BigInt64Array(count), dims)
          : elemType === 'bool'
            ? new OrtTensor('bool', new Uint8Array(count), dims)
            : new OrtTensor('float32', new Float32Array(count), dims);
    }
  }

  private async run(feeds: Record<string, OrtTensor>) {
    const outputs = (await this.session.run({
      ...this.state,
      ...feeds,
    })) as Record<string, OrtTensor>;
    this.state = extractState(
      outputs,
      this.session.outputNames,
      this.session.inputNames
    );
    return outputs;
  }

  private emptyEmbFeeds(exceptName?: string) {
    const feeds: Record<string, OrtTensor> = {};
    if (this.textEmbName !== exceptName) {
      feeds[this.textEmbName] = new OrtTensor(
        'float32',
        new Float32Array(0),
        [1, 0, this.textEmbDim]
      );
    }
    if (this.voiceEmbName && this.voiceEmbName !== exceptName) {
      feeds[this.voiceEmbName] = new OrtTensor(
        'float32',
        new Float32Array(0),
        [1, 0, this.voiceEmbDim]
      );
    }
    return feeds;
  }

  async conditionVoice(voiceData: Float32Array, shape: readonly number[]) {
    const voiceInput = this.voiceEmbName ?? this.textEmbName;
    await this.run({
      sequence: new OrtTensor('float32', new Float32Array(0), [1, 0, this.seqDim]),
      ...this.emptyEmbFeeds(voiceInput),
      [voiceInput]: new OrtTensor('float32', voiceData, [...shape]),
    });
  }

  async conditionText(textData: Float32Array, shape: readonly number[]) {
    await this.run({
      sequence: new OrtTensor('float32', new Float32Array(0), [1, 0, this.seqDim]),
      ...this.emptyEmbFeeds(this.textEmbName),
      [this.textEmbName]: new OrtTensor('float32', textData, [...shape]),
    });
  }

  async stepAR(seq: Float32Array) {
    const outputs = await this.run({
      sequence: new OrtTensor('float32', seq, [1, 1, this.seqDim]),
      ...this.emptyEmbFeeds(),
    });
    const conditioning =
      outputs.conditioning ?? outputs[this.session.outputNames[0]!]!;
    const eosTensor = outputs.eos_logit ?? outputs[this.session.outputNames[1]!]!;
    const eos = (eosTensor.data as Float32Array)[0]!;
    return { conditioning, eos };
  }

  dispose() {
    try {
      this.session.release();
    } catch {}
  }
}

class ONNXMimiDecoder {
  private stateMetas: OnnxInputMeta[] = [];
  private state: OrtState = {};

  constructor(private readonly session: OrtSession) {}

  setAllInputMetas(metas: OnnxInputMeta[]) {
    this.stateMetas = metas.filter((meta) => meta.name.startsWith('state_'));
  }

  reset() {
    this.state = {};
    for (const { name, dims, elemType } of this.stateMetas) {
      const count = dims.reduce((acc, dim) => acc * Math.max(1, dim), 1);
      this.state[name] =
        elemType === 'int64'
          ? new OrtTensor('int64', new BigInt64Array(count), dims)
          : elemType === 'bool'
            ? new OrtTensor('bool', new Uint8Array(count), dims)
            : new OrtTensor('float32', new Float32Array(count), dims);
    }
  }

  async decode(latents: Float32Array, frames: number) {
    const outputs = (await this.session.run({
      latent: new OrtTensor('float32', latents, [1, frames, 32]),
      ...this.state,
    })) as Record<string, OrtTensor>;

    const newState: OrtState = {};
    for (let i = 1; i < this.session.outputNames.length; i += 1) {
      const inputName = `state_${i - 1}`;
      if (this.session.inputNames.includes(inputName)) {
        const tensor = outputs[this.session.outputNames[i]!]!;
        if (tensor) {
          newState[inputName] = tensor;
        }
      }
    }
    if (Object.keys(newState).length > 0) {
      this.state = newState;
    }

    const audioTensor = outputs[this.session.outputNames[0]!]!;
    return audioTensor.data as Float32Array;
  }

  dispose() {
    try {
      this.session.release();
    } catch {}
  }
}

class ONNXMimiEncoder {
  constructor(private readonly session: OrtSession) {}

  async encode(audioData: Float32Array): Promise<VoiceEmbedding> {
    const outputs = (await this.session.run({
      audio: new OrtTensor('float32', audioData, [1, 1, audioData.length]),
    })) as Record<string, OrtTensor>;
    const embedding = outputs[this.session.outputNames[0]!]!;
    const dims = Array.from(embedding.dims);
    const data = new Float32Array(embedding.data as Float32Array);
    const shape: [number, number, number] =
      dims.length === 3
        ? [dims[0]!, dims[1]!, dims[2]!]
        : [1, dims[0]!, dims[1]!];
    return { data, shape };
  }

  dispose() {
    try {
      this.session.release();
    } catch {}
  }
}

function extractState(
  outputs: Record<string, OrtTensor>,
  outputNames: readonly string[],
  inputNames: readonly string[]
) {
  const state: OrtState = {};
  for (const name of outputNames) {
    if (name.startsWith('out_state_')) {
      const index = name.replace('out_state_', '');
      const inputName = `state_${index}`;
      if (inputNames.includes(inputName) && outputs[name]) {
        state[inputName] = outputs[name]!;
      }
    }
  }
  return state;
}

function gaussianNoise32() {
  const output = new Float32Array(32);
  for (let i = 0; i < 32; i += 1) {
    let u = 0;
    let v = 0;
    while (u === 0) {
      u = Math.random();
    }
    while (v === 0) {
      v = Math.random();
    }
    output[i] =
      Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * GAUSSIAN_STD;
  }
  return output;
}

function toNativeFsPath(path: string) {
  const raw = path.startsWith('file://') ? path.slice('file://'.length) : path;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function assertFileExists(path: string) {
  const uri = path.startsWith('file://') ? path : `file://${path}`;
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error(`Required file missing at ${uri}`);
  }
}

function readVarint(bytes: Uint8Array, pos: number): [number, number] {
  let result = 0;
  let shift = 0;
  while (pos < bytes.length) {
    const byte = bytes[pos++]!;
    result |= (byte & 0x7f) << shift;
    if (!(byte & 0x80)) {
      break;
    }
    shift += 7;
  }
  return [result, pos];
}

function skipProtoField(bytes: Uint8Array, pos: number, wireType: number) {
  switch (wireType) {
    case 0:
      while (pos < bytes.length && bytes[pos++]! & 0x80) {}
      return pos;
    case 1:
      return pos + 8;
    case 2: {
      const [length, next] = readVarint(bytes, pos);
      return next + length;
    }
    case 5:
      return pos + 4;
    default:
      throw new Error(`Unknown proto wire type: ${wireType}`);
  }
}

function parseDimProto(bytes: Uint8Array, start: number, end: number) {
  let pos = start;
  let dimValue = 0;
  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 0) {
      const [value, p2] = readVarint(bytes, pos);
      pos = p2;
      dimValue = value;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return dimValue;
}

function parseShapeProto(bytes: Uint8Array, start: number, end: number) {
  const dims: number[] = [];
  let pos = start;
  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      dims.push(parseDimProto(bytes, pos, pos + length));
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return dims;
}

function parseTensorTypeProto(bytes: Uint8Array, start: number, end: number) {
  let pos = start;
  let dims: number[] = [];
  let elemType: OnnxInputMeta['elemType'] = 'float32';
  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 0) {
      const [value, p2] = readVarint(bytes, pos);
      pos = p2;
      elemType = value === 7 ? 'int64' : value === 9 ? 'bool' : 'float32';
    } else if (field === 2 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      dims = parseShapeProto(bytes, pos, pos + length);
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return { dims, elemType };
}

function parseTypeProto(bytes: Uint8Array, start: number, end: number) {
  let pos = start;
  let dims: number[] = [];
  let elemType: OnnxInputMeta['elemType'] = 'float32';
  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      const parsed = parseTensorTypeProto(bytes, pos, pos + length);
      dims = parsed.dims;
      elemType = parsed.elemType;
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return { dims, elemType };
}

function parseValueInfoProto(
  bytes: Uint8Array,
  start: number,
  end: number
): OnnxInputMeta | null {
  let pos = start;
  let name = '';
  let dims: number[] = [];
  let elemType: OnnxInputMeta['elemType'] = 'float32';
  const decoder = new TextDecoder();

  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      name = decoder.decode(bytes.subarray(pos, pos + length));
      pos += length;
    } else if (field === 2 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      const parsed = parseTypeProto(bytes, pos, pos + length);
      dims = parsed.dims;
      elemType = parsed.elemType;
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }

  return name ? { name, dims, elemType } : null;
}

function parseGraphProtoAllInputs(bytes: Uint8Array, start: number, end: number) {
  const results: OnnxInputMeta[] = [];
  let pos = start;
  while (pos < end) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 11 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      const meta = parseValueInfoProto(bytes, pos, pos + length);
      if (meta) {
        results.push(meta);
      }
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return results;
}

function parseOnnxModelAllInputs(bytes: Uint8Array) {
  let pos = 0;
  while (pos < bytes.length) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 7 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      return parseGraphProtoAllInputs(bytes, pos, pos + length);
    }
    pos = skipProtoField(bytes, pos, wire);
  }
  return [];
}

const CACHE_VERSION = 2;

async function loadAllInputMetasCached(modelFilePath: string) {
  const cachePath = modelFilePath.replace(/\.onnx$/i, '.input_shapes.json');
  try {
    const cacheInfo = await FileSystem.getInfoAsync(
      cachePath.startsWith('file://') ? cachePath : `file://${cachePath}`
    );
    if (cacheInfo.exists) {
      const json = await FileSystem.readAsStringAsync(cachePath);
      const parsed = JSON.parse(json) as
        | { v: number; metas: OnnxInputMeta[] }
        | OnnxInputMeta[];
      const metas = Array.isArray(parsed)
        ? parsed
        : parsed.v === CACHE_VERSION
          ? parsed.metas
          : null;
      if (metas) {
        return metas;
      }
    }
  } catch {}

  const bytes = await readBinaryFile(modelFilePath);
  const metas = parseOnnxModelAllInputs(bytes);
  try {
    await FileSystem.writeAsStringAsync(
      cachePath,
      JSON.stringify({ v: CACHE_VERSION, metas })
    );
  } catch {}
  return metas;
}

function parseSentencePiece(bytes: Uint8Array): SPPiece {
  let piece = '';
  let score = 0;
  let type = 1;
  let pos = 0;
  const decoder = new TextDecoder();

  while (pos < bytes.length) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      piece = decoder.decode(bytes.subarray(pos, pos + length));
      pos += length;
    } else if (field === 2 && wire === 5) {
      const view = new DataView(bytes.buffer, bytes.byteOffset + pos, 4);
      score = view.getFloat32(0, true);
      pos += 4;
    } else if (field === 3 && wire === 0) {
      const [value, p2] = readVarint(bytes, pos);
      type = value;
      pos = p2;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }

  return { piece, score, type };
}

function parseTokenizerModel(bytes: Uint8Array) {
  const pieces: SPPiece[] = [];
  let pos = 0;
  while (pos < bytes.length) {
    const [tag, p1] = readVarint(bytes, pos);
    pos = p1;
    const field = tag >> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      const [length, p2] = readVarint(bytes, pos);
      pos = p2;
      pieces.push(parseSentencePiece(bytes.subarray(pos, pos + length)));
      pos += length;
    } else {
      pos = skipProtoField(bytes, pos, wire);
    }
  }
  return pieces;
}

function buildVocab(pieces: SPPiece[]) {
  const vocab = new Map<string, VocabEntry>();
  let unkId = 0;
  let maxLen = 0;

  for (let id = 0; id < pieces.length; id += 1) {
    const { piece, score, type } = pieces[id]!;
    if (type === 2) {
      unkId = id;
      continue;
    }
    if (type === 3 || type === 7) {
      continue;
    }
    vocab.set(piece, { id, score });
    if (piece.length > maxLen) {
      maxLen = piece.length;
    }
  }

  return { vocab, unkId, maxLen };
}

function tokenize(
  text: string,
  vocab: Map<string, VocabEntry>,
  unkId: number,
  maxPieceLen: number
) {
  const input = (`\u2581${text.trim()}`).replace(/ /g, '\u2581');
  const length = input.length;
  const dp = new Float64Array(length + 1).fill(-Infinity);
  const prev = new Int32Array(length + 1).fill(-1);
  const tokenIds = new Int32Array(length + 1).fill(unkId);
  dp[0] = 0;

  for (let i = 0; i < length; i += 1) {
    if (dp[i] === -Infinity) {
      continue;
    }
    for (let subLength = 1; subLength <= Math.min(maxPieceLen, length - i); subLength += 1) {
      const sub = input.slice(i, i + subLength);
      const entry = vocab.get(sub);
      if (entry) {
        const score = dp[i]! + entry.score;
        if (score > dp[i + subLength]!) {
          dp[i + subLength] = score;
          prev[i + subLength] = i;
          tokenIds[i + subLength] = entry.id;
        }
      }
    }
    const unkScore = dp[i]! - 20;
    if (unkScore > dp[i + 1]!) {
      dp[i + 1] = unkScore;
      prev[i + 1] = i;
      tokenIds[i + 1] = unkId;
    }
  }

  const result: number[] = [];
  let pos = length;
  while (pos > 0) {
    result.unshift(tokenIds[pos]!);
    pos = prev[pos]!;
  }
  return result;
}

function preprocessText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

async function loadReferenceVoice(
  mimiEncoder: ONNXMimiEncoder
): Promise<VoiceEmbedding> {
  const voicePath = getModelPath('reference_sample.wav');
  const cachePath = getModelPath('reference_sample.emb');
  const cacheInfo = await FileSystem.getInfoAsync(cachePath);

  if (cacheInfo.exists) {
    const bytes = await readBinaryFile(cachePath);
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    const version = view.getUint32(0, true);
    if (version === 3) {
      const frameCount = view.getUint32(4, true);
      const embDim = view.getUint32(8, true);
      const raw = new Float32Array(
        bytes.buffer,
        bytes.byteOffset + 12,
        frameCount * embDim
      );
      const data = new Float32Array(raw.length);
      data.set(raw);
      return { data, shape: [1, frameCount, embDim] };
    }
  }

  const bytes = await readBinaryFile(voicePath);
  const pcm = parseWavToFloat32(bytes, TTS_SAMPLE_RATE);
  const voice = await mimiEncoder.encode(pcm);

  const header = new ArrayBuffer(12 + voice.data.length * 4);
  const headerView = new DataView(header);
  headerView.setUint32(0, 3, true);
  headerView.setUint32(4, voice.shape[1], true);
  headerView.setUint32(8, voice.shape[2], true);
  new Float32Array(header, 12).set(voice.data);
  await FileSystem.writeAsStringAsync(
    cachePath,
    encodeBase64FromBytes(new Uint8Array(header)),
    { encoding: FileSystem.EncodingType.Base64 }
  );

  return voice;
}

let runtime: RuntimeBundle | null = null;
let initPromise: Promise<boolean> | null = null;

export async function initPocketTTSRuntime(): Promise<boolean> {
  if (runtime) {
    return true;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const textConditionerPath = toNativeFsPath(getModelPath('text_conditioner.onnx'));
      const backbonePath = toNativeFsPath(getModelPath('flow_lm_main.onnx'));
      const flowNetPath = toNativeFsPath(getModelPath('flow_lm_flow.onnx'));
      const mimiDecoderPath = toNativeFsPath(getModelPath('mimi_decoder.onnx'));
      const mimiEncoderPath = toNativeFsPath(getModelPath('mimi_encoder.onnx'));
      const tokenizerPath = getModelPath('tokenizer.model');
      const referenceVoicePath = getModelPath('reference_sample.wav');

      for (const path of [
        textConditionerPath,
        backbonePath,
        flowNetPath,
        mimiDecoderPath,
        mimiEncoderPath,
        tokenizerPath,
        referenceVoicePath,
      ]) {
        await assertFileExists(path);
      }

      const [
        textConditioner,
        backboneSession,
        flowNet,
        mimiDecoderSession,
        mimiEncoderSession,
      ] = await Promise.all([
        OrtSession.create(textConditionerPath),
        OrtSession.create(backbonePath),
        OrtSession.create(flowNetPath),
        OrtSession.create(mimiDecoderPath),
        OrtSession.create(mimiEncoderPath),
      ]);

      const backbone = new ONNXBackboneAdapter(backboneSession);
      const mimiDecoder = new ONNXMimiDecoder(mimiDecoderSession);
      const mimiEncoder = new ONNXMimiEncoder(mimiEncoderSession);

      const [backboneMetas, mimiMetas, tokenizerBytes] = await Promise.all([
        loadAllInputMetasCached(backbonePath),
        loadAllInputMetasCached(mimiDecoderPath),
        readBinaryFile(tokenizerPath),
      ]);

      backbone.setAllInputMetas(backboneMetas);
      backbone.reset();
      mimiDecoder.setAllInputMetas(mimiMetas);
      mimiDecoder.reset();

      const pieces = parseTokenizerModel(tokenizerBytes);
      const { vocab, unkId, maxLen } = buildVocab(pieces);
      const voice = await loadReferenceVoice(mimiEncoder);

      runtime = {
        textConditioner,
        backbone,
        flowNet,
        mimiDecoder,
        mimiEncoder,
        vocab,
        unkId,
        maxPieceLen: maxLen,
        voice,
      };

      return true;
    } catch (error) {
      console.warn('[PocketTTS] init failed:', error);
      runtime = null;
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export function isPocketTTSReady() {
  return runtime !== null;
}

export async function synthesizeWithPocketTTS(text: string): Promise<Float32Array> {
  const ready = await initPocketTTSRuntime();
  if (!ready || !runtime) {
    throw new Error('PocketTTS runtime is not ready');
  }

  const processed = preprocessText(text);
  const tokenIds = tokenize(
    processed,
    runtime.vocab,
    runtime.unkId,
    runtime.maxPieceLen
  );
  if (tokenIds.length === 0) {
    return new Float32Array(0);
  }

  const tokenTensor = new OrtTensor(
    'int64',
    new BigInt64Array(tokenIds.map(BigInt)),
    [1, tokenIds.length]
  );
  const textConditionerOutputs = (await runtime.textConditioner.run({
    token_ids: tokenTensor,
  })) as Record<string, OrtTensor>;
  const rawTextEmbedding =
    textConditionerOutputs[runtime.textConditioner.outputNames[0]!]!;
  const dims = Array.from(rawTextEmbedding.dims);
  const textEmbedding =
    dims.length === 2
      ? new OrtTensor('float32', rawTextEmbedding.data as Float32Array, [
          1,
          dims[0]!,
          dims[1]!,
        ])
      : rawTextEmbedding;
  const textEmbeddingDims = Array.from(textEmbedding.dims) as [number, number, number];

  runtime.backbone.reset();
  await runtime.backbone.conditionVoice(runtime.voice.data, runtime.voice.shape);
  await runtime.backbone.conditionText(
    textEmbedding.data as Float32Array,
    textEmbeddingDims
  );
  runtime.mimiDecoder.reset();

  let currentSeq = new Float32Array(32).fill(Number.NaN);
  const allLatents: Float32Array[] = [];
  let eosStep: number | null = null;
  const dt = 1 / LSD_STEPS;

  for (let step = 0; step < MAX_FRAMES; step += 1) {
    const { conditioning, eos } = await runtime.backbone.stepAR(currentSeq);
    if (eos > EOS_THRESHOLD && eosStep === null) {
      eosStep = step;
    }

    let xData = gaussianNoise32();
    for (let substep = 0; substep < LSD_STEPS; substep += 1) {
      const sVal = substep / LSD_STEPS;
      const tVal = sVal + dt;
      const flowOutputs = (await runtime.flowNet.run({
        c: conditioning,
        s: new OrtTensor('float32', new Float32Array([sVal]), [1, 1]),
        t: new OrtTensor('float32', new Float32Array([tVal]), [1, 1]),
        x: new OrtTensor('float32', new Float32Array(xData), [1, 32]),
      })) as Record<string, OrtTensor>;
      const flowDir =
        (flowOutputs.flow_dir ??
          flowOutputs[runtime.flowNet.outputNames[0]!]!)!.data as Float32Array;
      for (let i = 0; i < 32; i += 1) {
        xData[i] += flowDir[i]! * dt;
      }
    }

    allLatents.push(new Float32Array(xData));
    currentSeq = new Float32Array(xData);

    if (eosStep !== null && step >= eosStep + FRAMES_AFTER_EOS) {
      break;
    }
  }

  if (allLatents.length === 0) {
    return new Float32Array(0);
  }

  const packed = new Float32Array(allLatents.length * 32);
  for (let i = 0; i < allLatents.length; i += 1) {
    packed.set(allLatents[i]!, i * 32);
  }

  return runtime.mimiDecoder.decode(packed, allLatents.length);
}

export function disposePocketTTSRuntime() {
  if (!runtime) {
    return;
  }
  try {
    runtime.textConditioner.release();
  } catch {}
  runtime.backbone.dispose();
  try {
    runtime.flowNet.release();
  } catch {}
  runtime.mimiDecoder.dispose();
  runtime.mimiEncoder.dispose();
  runtime = null;
  initPromise = null;
}
