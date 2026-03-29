import * as FileSystem from 'expo-file-system/legacy';
import {
  InferenceSession as OrtSession,
  Tensor as OrtTensor,
} from 'onnxruntime-react-native';

import { getModelPath } from '@/services/models/model-registry';
import { parseWavToFloat32, readBinaryFile, STT_SAMPLE_RATE } from './wav-utils';

interface ParakeetConfig {
  sampleRate: number;
  melBins: number;
  frameShiftSeconds: number;
  subsamplingFactor: number;
  vocabSize: number;
  blankId: number;
  eouId: number;
  eobId: number;
  predHidden: number;
  predLayers: number;
  maxSymbolsPerStep: number;
}

export interface ParakeetTranscriptionResult {
  text: string;
  sawEou: boolean;
  sawEob: boolean;
}

const DEFAULT_CONFIG: ParakeetConfig = {
  sampleRate: STT_SAMPLE_RATE,
  melBins: 128,
  frameShiftSeconds: 0.01,
  subsamplingFactor: 8,
  vocabSize: 1025,
  blankId: 1024,
  eouId: 1024,
  eobId: 1024,
  predHidden: 640,
  predLayers: 1,
  maxSymbolsPerStep: 10,
};

const MEL_N_FFT = 512;
const MEL_WIN_LENGTH = 400;
const MEL_HOP_LENGTH = 160;
const MEL_PREEMPH = 0.97;
const MEL_LOG_ZERO_GUARD = 2 ** -24;
const MEL_FREQ_BINS = (MEL_N_FFT >> 1) + 1;
const INV_SQRT2 = Math.SQRT1_2;
const F_SP = 200 / 3;
const MIN_LOG_HZ = 1000;
const MIN_LOG_MEL = MIN_LOG_HZ / F_SP;
const LOG_STEP = Math.log(6.4) / 27;

const MEL_FILTERBANK_CACHE = new Map<number, Float32Array>();
const FFT_TWIDDLE_CACHE = new Map<number, FFTTwiddles>();
let sharedHannWindow: Float64Array | null = null;

interface FFTTwiddles {
  cos: Float64Array;
  sin: Float64Array;
  bitrev: Uint32Array;
}

class ParakeetTokenizer {
  readonly vocabSize: number;
  readonly blankId: number;
  private readonly sanitizedTokens: readonly string[];
  private readonly controlTokenIds: ReadonlySet<number>;

  constructor(readonly idToToken: readonly string[], blankId?: number) {
    this.vocabSize = idToToken.length;
    const discoveredBlankId = idToToken.findIndex((token) => token === '<blk>');
    this.blankId =
      blankId ?? (discoveredBlankId >= 0 ? discoveredBlankId : idToToken.length);
    this.sanitizedTokens = idToToken.map((token) =>
      token.replace(/\u2581/g, ' ')
    );
    this.controlTokenIds = new Set(
      idToToken.flatMap((token, index) =>
        /^<[^>\s]+>$/.test(token) && token !== '<blk>' ? [index] : []
      )
    );
  }

  static async fromFile(fileUri: string, blankId?: number) {
    const text = await FileSystem.readAsStringAsync(fileUri);
    const lines = text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    const indexedVocabulary = lines.every((line) => {
      const parts = line.trim().split(/\s+/);
      return parts.length === 2 && Number.isInteger(Number.parseInt(parts[1] ?? '', 10));
    });

    const idToToken: string[] = [];
    if (indexedVocabulary) {
      for (const line of lines) {
        const [token, idText] = line.trim().split(/\s+/);
        const id = Number.parseInt(idText ?? '', 10);
        if (!token || !Number.isInteger(id) || id < 0) {
          continue;
        }
        idToToken[id] = token;
      }
    } else {
      idToToken.push(...lines.map((line) => line.trim()));
    }

    return new ParakeetTokenizer(idToToken, blankId);
  }

  decode(ids: readonly number[], options: { skipControlTokens?: boolean } = {}) {
    return ids
      .filter((id) => id !== this.blankId)
      .filter((id) => !options.skipControlTokens || !this.controlTokenIds.has(id))
      .map((id) => this.sanitizedTokens[id] ?? '')
      .join('')
      .replace(/^\s+/, '')
      .replace(/\s+(?=[^\w\s])/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

function hzToMel(freq: number): number {
  return freq >= MIN_LOG_HZ
    ? MIN_LOG_MEL + Math.log(freq / MIN_LOG_HZ) / LOG_STEP
    : freq / F_SP;
}

function melToHz(mel: number): number {
  return mel >= MIN_LOG_MEL
    ? MIN_LOG_HZ * Math.exp(LOG_STEP * (mel - MIN_LOG_MEL))
    : mel * F_SP;
}

function getCachedMelFilterbank(nMels: number): Float32Array {
  const cached = MEL_FILTERBANK_CACHE.get(nMels);
  if (cached) {
    return cached;
  }

  const fMax = STT_SAMPLE_RATE / 2;
  const allFreqs = new Float64Array(MEL_FREQ_BINS);
  for (let index = 0; index < MEL_FREQ_BINS; index += 1) {
    allFreqs[index] = (fMax * index) / (MEL_FREQ_BINS - 1);
  }

  const melMin = hzToMel(0);
  const melMax = hzToMel(fMax);
  const pointCount = nMels + 2;
  const filterPoints = new Float64Array(pointCount);
  for (let index = 0; index < pointCount; index += 1) {
    filterPoints[index] = melToHz(
      melMin + ((melMax - melMin) * index) / (pointCount - 1)
    );
  }

  const filterDiff = new Float64Array(pointCount - 1);
  for (let index = 0; index < pointCount - 1; index += 1) {
    filterDiff[index] = filterPoints[index + 1]! - filterPoints[index]!;
  }

  const filterbank = new Float32Array(nMels * MEL_FREQ_BINS);
  for (let melIndex = 0; melIndex < nMels; melIndex += 1) {
    const lower = filterPoints[melIndex]!;
    const upper = filterPoints[melIndex + 2]!;
    const lowerWidth = filterDiff[melIndex]!;
    const upperWidth = filterDiff[melIndex + 1]!;
    const enorm = 2 / (upper - lower);
    const offset = melIndex * MEL_FREQ_BINS;

    for (let freqIndex = 0; freqIndex < MEL_FREQ_BINS; freqIndex += 1) {
      const freq = allFreqs[freqIndex]!;
      const downSlope = (freq - lower) / lowerWidth;
      const upSlope = (upper - freq) / upperWidth;
      filterbank[offset + freqIndex] =
        Math.max(0, Math.min(downSlope, upSlope)) * enorm;
    }
  }

  MEL_FILTERBANK_CACHE.set(nMels, filterbank);
  return filterbank;
}

function getCachedPaddedHannWindow(): Float64Array {
  if (sharedHannWindow) {
    return sharedHannWindow;
  }

  const window = new Float64Array(MEL_N_FFT);
  const padLeft = (MEL_N_FFT - MEL_WIN_LENGTH) >> 1;
  for (let index = 0; index < MEL_WIN_LENGTH; index += 1) {
    window[padLeft + index] =
      0.5 * (1 - Math.cos((2 * Math.PI * index) / (MEL_WIN_LENGTH - 1)));
  }
  sharedHannWindow = window;
  return window;
}

function getCachedTwiddles(size: number): FFTTwiddles {
  const cached = FFT_TWIDDLE_CACHE.get(size);
  if (cached) {
    return cached;
  }

  const bits = Math.log2(size);
  if ((1 << bits) !== size) {
    throw new Error(`FFT size must be a power of two, received ${size}`);
  }

  const half = size >> 1;
  const cos = new Float64Array(half);
  const sin = new Float64Array(half);
  for (let index = 0; index < half; index += 1) {
    const angle = (-2 * Math.PI * index) / size;
    cos[index] = Math.cos(angle);
    sin[index] = Math.sin(angle);
  }

  const bitrev = new Uint32Array(size);
  for (let index = 0; index < size; index += 1) {
    let value = index;
    let reversed = 0;
    for (let bit = 0; bit < bits; bit += 1) {
      reversed = (reversed << 1) | (value & 1);
      value >>= 1;
    }
    bitrev[index] = reversed;
  }

  const twiddles = { cos, sin, bitrev };
  FFT_TWIDDLE_CACHE.set(size, twiddles);
  return twiddles;
}

function fft(
  re: Float64Array,
  im: Float64Array,
  size: number,
  twiddles: FFTTwiddles
) {
  const { bitrev } = twiddles;
  for (let index = 0; index < size; index += 1) {
    const reversed = bitrev[index]!;
    if (index < reversed) {
      let tmp = re[index]!;
      re[index] = re[reversed]!;
      re[reversed] = tmp;
      tmp = im[index]!;
      im[index] = im[reversed]!;
      im[reversed] = tmp;
    }
  }

  if (size >= 2) {
    for (let index = 0; index < size; index += 2) {
      const q = index + 1;
      const tRe = re[q]!;
      const tIm = im[q]!;
      re[q] = re[index]! - tRe;
      im[q] = im[index]! - tIm;
      re[index] = re[index]! + tRe;
      im[index] = im[index]! + tIm;
    }
  }

  if (size >= 4) {
    for (let index = 0; index < size; index += 4) {
      const q0 = index + 2;
      const tRe0 = re[q0]!;
      const tIm0 = im[q0]!;
      re[q0] = re[index]! - tRe0;
      im[q0] = im[index]! - tIm0;
      re[index] = re[index]! + tRe0;
      im[index] = im[index]! + tIm0;

      const p1 = index + 1;
      const q1 = index + 3;
      const tRe1 = im[q1]!;
      const tIm1 = -re[q1]!;
      re[q1] = re[p1]! - tRe1;
      im[q1] = im[p1]! - tIm1;
      re[p1] = re[p1]! + tRe1;
      im[p1] = im[p1]! + tIm1;
    }
  }

  if (size >= 8) {
    for (let index = 0; index < size; index += 8) {
      {
        const q = index + 4;
        const tRe = re[q]!;
        const tIm = im[q]!;
        re[q] = re[index]! - tRe;
        im[q] = im[index]! - tIm;
        re[index] = re[index]! + tRe;
        im[index] = im[index]! + tIm;
      }
      {
        const wCos = INV_SQRT2;
        const wSin = -INV_SQRT2;
        const p = index + 1;
        const q = index + 5;
        const tRe = re[q]! * wCos - im[q]! * wSin;
        const tIm = re[q]! * wSin + im[q]! * wCos;
        re[q] = re[p]! - tRe;
        im[q] = im[p]! - tIm;
        re[p] = re[p]! + tRe;
        im[p] = im[p]! + tIm;
      }
      {
        const p = index + 2;
        const q = index + 6;
        const tRe = im[q]!;
        const tIm = -re[q]!;
        re[q] = re[p]! - tRe;
        im[q] = im[p]! - tIm;
        re[p] = re[p]! + tRe;
        im[p] = im[p]! + tIm;
      }
      {
        const wCos = -INV_SQRT2;
        const wSin = -INV_SQRT2;
        const p = index + 3;
        const q = index + 7;
        const tRe = re[q]! * wCos - im[q]! * wSin;
        const tIm = re[q]! * wSin + im[q]! * wCos;
        re[q] = re[p]! - tRe;
        im[q] = im[p]! - tIm;
        re[p] = re[p]! + tRe;
        im[p] = im[p]! + tIm;
      }
    }
  }

  for (let len = 16; len <= size; len <<= 1) {
    const halfLen = len >> 1;
    const step = size / len;
    for (let index = 0; index < size; index += len) {
      for (let k = 0; k < halfLen; k += 1) {
        const twiddleIndex = k * step;
        const wCos = twiddles.cos[twiddleIndex]!;
        const wSin = twiddles.sin[twiddleIndex]!;
        const p = index + k;
        const q = p + halfLen;
        const tRe = re[q]! * wCos - im[q]! * wSin;
        const tIm = re[q]! * wSin + im[q]! * wCos;
        re[q] = re[p]! - tRe;
        im[q] = im[p]! - tIm;
        re[p] = re[p]! + tRe;
        im[p] = im[p]! + tIm;
      }
    }
  }
}

class JSMelProcessor {
  private readonly melFilterbank: Float32Array;
  private readonly hannWindow: Float64Array;
  private readonly twiddles: FFTTwiddles;
  private readonly twiddlesHalf: FFTTwiddles;
  private readonly fftRe: Float64Array;
  private readonly fftIm: Float64Array;
  private readonly powerBuf: Float32Array;
  private readonly fbBounds: Int32Array;
  private paddedBuffer: Float64Array | null = null;
  private rawMelBuffer: Float32Array | null = null;

  constructor(private readonly nMels: number) {
    this.melFilterbank = getCachedMelFilterbank(nMels);
    this.hannWindow = getCachedPaddedHannWindow();
    this.twiddles = getCachedTwiddles(MEL_N_FFT);
    this.twiddlesHalf = getCachedTwiddles(MEL_N_FFT >> 1);
    this.fftRe = new Float64Array(MEL_N_FFT >> 1);
    this.fftIm = new Float64Array(MEL_N_FFT >> 1);
    this.powerBuf = new Float32Array(MEL_FREQ_BINS);
    this.fbBounds = new Int32Array(nMels * 2);

    for (let melIndex = 0; melIndex < nMels; melIndex += 1) {
      const offset = melIndex * MEL_FREQ_BINS;
      let start = -1;
      let end = -1;
      for (let freqIndex = 0; freqIndex < MEL_FREQ_BINS; freqIndex += 1) {
        if (this.melFilterbank[offset + freqIndex]! > 0) {
          if (start === -1) {
            start = freqIndex;
          }
          end = freqIndex;
        }
      }
      this.fbBounds[melIndex * 2] = start === -1 ? 0 : start;
      this.fbBounds[melIndex * 2 + 1] = end + 1;
    }
  }

  process(audio: Float32Array) {
    const sampleCount = audio.length;
    if (sampleCount === 0) {
      return { features: new Float32Array(0), frameCount: 0, validLength: 0 };
    }

    const pad = MEL_N_FFT >> 1;
    const paddedLength = sampleCount + 2 * pad;
    const frameCount =
      Math.floor((paddedLength - MEL_N_FFT) / MEL_HOP_LENGTH) + 1;
    const validLength = frameCount;
    if (validLength === 0) {
      return { features: new Float32Array(0), frameCount: 0, validLength: 0 };
    }

    if (!this.rawMelBuffer || this.rawMelBuffer.length < this.nMels * frameCount) {
      this.rawMelBuffer = new Float32Array(
        Math.ceil(this.nMels * frameCount * 1.2)
      );
    }

    return {
      features: this.computeRawMel(audio, frameCount),
      frameCount,
      validLength,
    };
  }

  private computeRawMel(audio: Float32Array, frameCount: number) {
    const sampleCount = audio.length;
    const pad = MEL_N_FFT >> 1;
    const paddedLength = sampleCount + 2 * pad;
    if (!this.paddedBuffer || this.paddedBuffer.length < paddedLength) {
      this.paddedBuffer = new Float64Array(Math.ceil(paddedLength * 1.2));
    }
    const padded = this.paddedBuffer;
    padded.fill(0, 0, paddedLength);

    padded[pad] = Math.fround(audio[0]!);
    for (let index = 1; index < sampleCount; index += 1) {
      padded[pad + index] = Math.fround(
        audio[index]! - MEL_PREEMPH * audio[index - 1]!
      );
    }

    const rawMel = this.rawMelBuffer!.subarray(0, this.nMels * frameCount);
    const halfN = MEL_N_FFT >> 1;
    const quarterN = halfN >> 1;

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const offset = frameIndex * MEL_HOP_LENGTH;
      for (let k = 0; k < halfN; k += 1) {
        const sampleIndex = k << 1;
        this.fftRe[k] =
          padded[offset + sampleIndex]! * this.hannWindow[sampleIndex]!;
        this.fftIm[k] =
          padded[offset + sampleIndex + 1]! *
          this.hannWindow[sampleIndex + 1]!;
      }

      fft(this.fftRe, this.fftIm, halfN, this.twiddlesHalf);

      const z0r = this.fftRe[0]!;
      const z0i = this.fftIm[0]!;
      this.powerBuf[0] = (z0r + z0i) * (z0r + z0i);
      this.powerBuf[halfN] = (z0r - z0i) * (z0r - z0i);

      for (let k = 1; k < quarterN; k += 1) {
        const rk = this.fftRe[k]!;
        const ik = this.fftIm[k]!;
        const rnk = this.fftRe[halfN - k]!;
        const ink = this.fftIm[halfN - k]!;

        const xeR = 0.5 * (rk + rnk);
        const xeI = 0.5 * (ik - ink);
        const xoR = 0.5 * (ik + ink);
        const xoI = -0.5 * (rk - rnk);

        const wc = this.twiddles.cos[k]!;
        const ws = this.twiddles.sin[k]!;
        const tr = xoR * wc - xoI * ws;
        const ti = xoR * ws + xoI * wc;

        const xkR = xeR + tr;
        const xkI = xeI + ti;
        this.powerBuf[k] = xkR * xkR + xkI * xkI;

        const xnkR = xeR - tr;
        const xnkI = xeI - ti;
        this.powerBuf[halfN - k] = xnkR * xnkR + xnkI * xnkI;
      }

      const quarterRe = this.fftRe[quarterN]!;
      const quarterIm = this.fftIm[quarterN]!;
      this.powerBuf[quarterN] = quarterRe * quarterRe + quarterIm * quarterIm;

      for (let melIndex = 0; melIndex < this.nMels; melIndex += 1) {
        let melValue = 0;
        const filterbankOffset = melIndex * MEL_FREQ_BINS;
        const start = this.fbBounds[melIndex * 2]!;
        const end = this.fbBounds[melIndex * 2 + 1]!;
        for (let freqIndex = start; freqIndex < end; freqIndex += 1) {
          melValue +=
            this.powerBuf[freqIndex]! *
            this.melFilterbank[filterbankOffset + freqIndex]!;
        }
        rawMel[melIndex * frameCount + frameIndex] = Math.log(
          melValue + MEL_LOG_ZERO_GUARD
        );
      }
    }

    return rawMel;
  }
}

function parseConfig(content: string): ParakeetConfig {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  return {
    sampleRate: Number(
      parsed.sampleRate ?? parsed.sample_rate ?? DEFAULT_CONFIG.sampleRate
    ),
    melBins: Number(parsed.melBins ?? parsed.mel_bins ?? DEFAULT_CONFIG.melBins),
    frameShiftSeconds: Number(
      parsed.frameShiftSeconds ??
        parsed.frame_shift_seconds ??
        DEFAULT_CONFIG.frameShiftSeconds
    ),
    subsamplingFactor: Number(
      parsed.subsamplingFactor ??
        parsed.subsampling_factor ??
        DEFAULT_CONFIG.subsamplingFactor
    ),
    vocabSize: Number(
      parsed.vocabSize ?? parsed.vocab_size ?? DEFAULT_CONFIG.vocabSize
    ),
    blankId: Number(parsed.blankId ?? parsed.blank_id ?? DEFAULT_CONFIG.blankId),
    eouId: Number(parsed.eouId ?? parsed.eou_id ?? DEFAULT_CONFIG.eouId),
    eobId: Number(parsed.eobId ?? parsed.eob_id ?? DEFAULT_CONFIG.eobId),
    predHidden: Number(
      parsed.predHidden ?? parsed.pred_hidden ?? DEFAULT_CONFIG.predHidden
    ),
    predLayers: Number(
      parsed.predLayers ?? parsed.pred_layers ?? DEFAULT_CONFIG.predLayers
    ),
    maxSymbolsPerStep: Number(
      parsed.maxSymbolsPerStep ??
        parsed.max_symbols_per_step ??
        DEFAULT_CONFIG.maxSymbolsPerStep
    ),
  };
}

function disposeTensor(tensor: unknown) {
  if (
    tensor &&
    typeof tensor === 'object' &&
    'dispose' in tensor &&
    typeof (tensor as { dispose?: unknown }).dispose === 'function'
  ) {
    try {
      (tensor as { dispose: () => void }).dispose();
    } catch {}
  }
}

function getTensorFromOutputs(
  outputs: Record<string, unknown>,
  preferredNames: string[]
): { tensor: OrtTensor; name: string } {
  for (const name of preferredNames) {
    const value = outputs[name];
    if (value) {
      return { tensor: value as OrtTensor, name };
    }
  }

  const first = Object.entries(outputs).find(([, value]) => Boolean(value));
  if (!first) {
    throw new Error('ONNX session produced no outputs');
  }
  return { tensor: first[1] as OrtTensor, name: first[0] };
}

function float16ToFloat32(value: number): number {
  const sign = (value & 0x8000) >> 15;
  const exponent = (value & 0x7c00) >> 10;
  const fraction = value & 0x03ff;

  if (exponent === 0) {
    if (fraction === 0) {
      return sign ? -0 : 0;
    }
    return (sign ? -1 : 1) * 2 ** -14 * (fraction / 1024);
  }
  if (exponent === 0x1f) {
    return fraction === 0 ? (sign ? -Infinity : Infinity) : Number.NaN;
  }
  return (
    (sign ? -1 : 1) * 2 ** (exponent - 15) * (1 + fraction / 1024)
  );
}

function tensorDataToFloat32(data: unknown): Float32Array {
  if (data instanceof Float32Array) {
    return data;
  }
  if (data instanceof Uint16Array) {
    const output = new Float32Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      output[i] = float16ToFloat32(data[i]!);
    }
    return output;
  }
  if (ArrayBuffer.isView(data)) {
    const view = data as unknown as ArrayLike<number>;
    const output = new Float32Array(view.length);
    for (let i = 0; i < view.length; i += 1) {
      output[i] = Number(view[i] ?? 0);
    }
    return output;
  }
  if (Array.isArray(data)) {
    return Float32Array.from(data.map((value) => Number(value)));
  }
  return new Float32Array(0);
}

function argmax(data: Float32Array, count: number) {
  let bestIndex = 0;
  let bestValue = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const value = data[i] ?? -Infinity;
    if (value > bestValue) {
      bestValue = value;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function getTensorInputShape(
  session: OrtSession,
  inputName: string,
  fallback: number[]
) {
  const metadata = session.inputMetadata as readonly {
    name: string;
    isTensor: boolean;
    shape?: readonly (number | string)[];
  }[];
  const meta = metadata.find(
    (entry) => entry.name === inputName && entry.isTensor
  );
  if (!meta?.shape?.length) {
    return fallback;
  }

  return meta.shape.map((dim, index) => {
    if (typeof dim === 'number' && Number.isFinite(dim) && dim >= 0) {
      return dim;
    }
    return fallback[index] ?? 1;
  });
}

class ParakeetOrtRuntime {
  private readonly melProcessor: JSMelProcessor;
  private readonly encoderAudioInputName: string;
  private readonly encoderLengthInputName: string;
  private readonly decoderEncoderInputName: string;
  private readonly decoderTargetsInputName: string;
  private readonly decoderState1InputName: string;
  private readonly decoderState2InputName: string;
  private readonly decoderTargetLengthInputName: string | null;
  private readonly logitsOutputName: string;
  private readonly state1OutputName: string;
  private readonly state2OutputName: string;
  private readonly decoderState1Shape: number[];
  private readonly decoderState2Shape: number[];

  constructor(
    private readonly encoderSession: OrtSession,
    private readonly decoderSession: OrtSession,
    private readonly tokenizer: ParakeetTokenizer,
    private readonly config: ParakeetConfig
  ) {
    this.melProcessor = new JSMelProcessor(config.melBins);
    this.encoderAudioInputName = encoderSession.inputNames.includes('audio_signal')
      ? 'audio_signal'
      : encoderSession.inputNames[0]!;
    this.encoderLengthInputName = encoderSession.inputNames.includes('length')
      ? 'length'
      : encoderSession.inputNames[1]!;
    this.decoderEncoderInputName = decoderSession.inputNames.includes(
      'encoder_outputs'
    )
      ? 'encoder_outputs'
      : decoderSession.inputNames[0]!;
    this.decoderTargetsInputName = decoderSession.inputNames.includes('targets')
      ? 'targets'
      : decoderSession.inputNames[1]!;
    this.decoderState1InputName = decoderSession.inputNames.includes('input_states_1')
      ? 'input_states_1'
      : decoderSession.inputNames[2]!;
    this.decoderState2InputName = decoderSession.inputNames.includes('input_states_2')
      ? 'input_states_2'
      : decoderSession.inputNames[3]!;
    this.decoderTargetLengthInputName = decoderSession.inputNames.includes(
      'target_length'
    )
      ? 'target_length'
      : null;
    this.logitsOutputName = decoderSession.outputNames.includes('outputs')
      ? 'outputs'
      : decoderSession.outputNames[0]!;
    this.state1OutputName = decoderSession.outputNames.includes('output_states_1')
      ? 'output_states_1'
      : decoderSession.outputNames.find(
          (name) => name.includes('state') && name.endsWith('1')
        ) ?? decoderSession.outputNames[1]!;
    this.state2OutputName = decoderSession.outputNames.includes('output_states_2')
      ? 'output_states_2'
      : decoderSession.outputNames.find(
          (name) => name.includes('state') && name.endsWith('2')
        ) ?? decoderSession.outputNames[2]!;
    this.decoderState1Shape = getTensorInputShape(decoderSession, this.decoderState1InputName, [
      this.config.predLayers,
      1,
      this.config.predHidden,
    ]);
    this.decoderState2Shape = getTensorInputShape(decoderSession, this.decoderState2InputName, [
      this.config.predLayers,
      1,
      this.config.predHidden,
    ]);
  }

  async transcribeDetailed(
    audio16k: Float32Array
  ): Promise<ParakeetTranscriptionResult> {
    if (audio16k.length < MEL_HOP_LENGTH) {
      return { text: '', sawEou: false, sawEob: false };
    }

    const { features, frameCount, validLength } = this.melProcessor.process(audio16k);
    if (!features.length || frameCount <= 0 || validLength <= 0) {
      return { text: '', sawEou: false, sawEob: false };
    }

    const inputTensor = new OrtTensor('float32', features, [
      1,
      this.config.melBins,
      frameCount,
    ]);
    const encoderLengthTensor = new OrtTensor(
      'int64',
      BigInt64Array.from([BigInt(validLength)]),
      [1]
    );

    let encoderOutputs: Record<string, unknown> | null = null;
    let encoderTensor: OrtTensor | null = null;
    let targetTensor: OrtTensor | null = null;
    let targetLengthTensor: OrtTensor | null = null;
    let encoderFrameTensor: OrtTensor | null = null;
    let state1: OrtTensor | null = null;
    let state2: OrtTensor | null = null;

    try {
      encoderOutputs = (await this.encoderSession.run({
        [this.encoderAudioInputName]: inputTensor,
        [this.encoderLengthInputName]: encoderLengthTensor,
      })) as Record<string, unknown>;

      encoderTensor = getTensorFromOutputs(encoderOutputs, ['outputs']).tensor;
      const encoderDims = Array.from(encoderTensor.dims as readonly number[]);
      if (encoderDims.length !== 3 || encoderDims[0] !== 1) {
        throw new Error(
          `Unexpected encoder output shape [${encoderDims.join(', ')}]`
        );
      }

      const dim1 = Number(encoderDims[1] ?? 0);
      const dim2 = Number(encoderDims[2] ?? 0);
      const likelyFeatureDim =
        dim1 === this.config.predHidden
          ? 1
          : dim2 === this.config.predHidden
            ? 2
            : dim1 > dim2
              ? 1
              : 2;
      const featureSize = likelyFeatureDim === 1 ? dim1 : dim2;
      const encodedFrames = likelyFeatureDim === 1 ? dim2 : dim1;
      if (!featureSize || !encodedFrames) {
        return { text: '', sawEou: false, sawEob: false };
      }

      const encoderData = tensorDataToFloat32(
        (encoderTensor as unknown as { data: unknown }).data
      );
      const encoderFrameBuffer = new Float32Array(featureSize);
      const targetIdBuffer = new Int32Array(1);
      const targetLengthData = new Int32Array([1]);

      encoderFrameTensor = new OrtTensor('float32', encoderFrameBuffer, [
        1,
        featureSize,
        1,
      ]);
      targetTensor = new OrtTensor('int32', targetIdBuffer, [1, 1]);
      if (this.decoderTargetLengthInputName) {
        targetLengthTensor = new OrtTensor('int32', targetLengthData, [1]);
      }

      state1 = new OrtTensor(
        'float32',
        new Float32Array(
          this.decoderState1Shape.reduce((acc, dim) => acc * dim, 1)
        ),
        this.decoderState1Shape
      );
      state2 = new OrtTensor(
        'float32',
        new Float32Array(
          this.decoderState2Shape.reduce((acc, dim) => acc * dim, 1)
        ),
        this.decoderState2Shape
      );

      const tokenIds: number[] = [];
      const blankId = this.config.blankId;
      const distributionSize = Math.max(
        this.config.vocabSize,
        this.config.blankId + 1,
        this.tokenizer.vocabSize
      );
      let sawEou = false;
      let sawEob = false;

      for (let frameIndex = 0; frameIndex < encodedFrames; frameIndex += 1) {
        for (let featureIndex = 0; featureIndex < featureSize; featureIndex += 1) {
          const sourceIndex =
            likelyFeatureDim === 1
              ? featureIndex * encodedFrames + frameIndex
              : frameIndex * featureSize + featureIndex;
          encoderFrameBuffer[featureIndex] = encoderData[sourceIndex] ?? 0;
        }

        let emittedOnFrame = 0;
        while (emittedOnFrame < this.config.maxSymbolsPerStep) {
          targetIdBuffer[0] =
            tokenIds.length > 0
              ? tokenIds[tokenIds.length - 1]!
              : blankId;
          const decoderFeeds: Record<string, OrtTensor> = {
            [this.decoderEncoderInputName]: encoderFrameTensor,
            [this.decoderTargetsInputName]: targetTensor,
            [this.decoderState1InputName]: state1,
            [this.decoderState2InputName]: state2,
          };
          if (this.decoderTargetLengthInputName && targetLengthTensor) {
            decoderFeeds[this.decoderTargetLengthInputName] = targetLengthTensor;
          }

          const decoderOutputs = (await this.decoderSession.run(
            decoderFeeds
          )) as Record<string, unknown>;
          const { tensor: logitsTensor } = getTensorFromOutputs(decoderOutputs, [
            this.logitsOutputName,
            'outputs',
          ]);
          const nextState1 = getTensorFromOutputs(decoderOutputs, [
            this.state1OutputName,
            'output_states_1',
          ]).tensor;
          const nextState2 = getTensorFromOutputs(decoderOutputs, [
            this.state2OutputName,
            'output_states_2',
          ]).tensor;

          const logitsData = tensorDataToFloat32(
            (logitsTensor as unknown as { data: unknown }).data
          );
          const sliceOffset = Math.max(0, logitsData.length - distributionSize);
          const logitsSlice = logitsData.subarray(
            sliceOffset,
            sliceOffset + distributionSize
          );
          const tokenId = argmax(logitsSlice, distributionSize);

          disposeTensor(logitsTensor);

          if (tokenId === blankId) {
            disposeTensor(nextState1);
            disposeTensor(nextState2);
            break;
          }

          const prevState1 = state1;
          const prevState2 = state2;
          state1 = nextState1;
          state2 = nextState2;
          disposeTensor(prevState1);
          disposeTensor(prevState2);

          tokenIds.push(tokenId);
          if (tokenId === this.config.eouId) {
            sawEou = true;
          }
          if (tokenId === this.config.eobId) {
            sawEob = true;
          }
          emittedOnFrame += 1;
        }
      }

      const text = this.tokenizer.decode(tokenIds, { skipControlTokens: true }).trim();
      if (text) {
        console.log(
          `[Parakeet] decoded tokens=${tokenIds.length} eou=${String(sawEou)} blank=${blankId} dist=${distributionSize} text="${text.slice(0, 120)}"`
        );
      }

      return {
        text,
        sawEou,
        sawEob,
      };
    } finally {
      disposeTensor(inputTensor);
      disposeTensor(encoderLengthTensor);
      disposeTensor(targetTensor);
      disposeTensor(targetLengthTensor);
      disposeTensor(encoderFrameTensor);
      disposeTensor(state1);
      disposeTensor(state2);
      if (encoderOutputs) {
        for (const value of Object.values(encoderOutputs)) {
          if (value !== encoderTensor) {
            disposeTensor(value);
          }
        }
      }
      if (encoderTensor) {
        disposeTensor(encoderTensor);
      }
    }
  }

  async transcribe(audio16k: Float32Array) {
    const result = await this.transcribeDetailed(audio16k);
    return result.text;
  }

  dispose() {
    try {
      this.encoderSession.release();
    } catch {}
    try {
      this.decoderSession.release();
    } catch {}
  }
}

let runtime: ParakeetOrtRuntime | null = null;
let initPromise: Promise<boolean> | null = null;

function getOptionalConfigPath() {
  return getModelPath('config.json');
}

async function readConfigOrDefault() {
  const configPath = getOptionalConfigPath();
  const info = await FileSystem.getInfoAsync(configPath);
  if (!info.exists) {
    return DEFAULT_CONFIG;
  }
  return parseConfig(await FileSystem.readAsStringAsync(configPath));
}

export async function initParakeetRuntime(): Promise<boolean> {
  if (runtime) {
    return true;
  }
  if (initPromise) {
    console.log('[Parakeet] awaiting existing init');
    return initPromise;
  }

  initPromise = (async () => {
    try {
      console.log('[Parakeet] init start');
      const vocabPath = getModelPath('vocab.txt');
      const encoderPath = getModelPath('encoder-model.int8.onnx');
      const decoderPath = getModelPath('decoder_joint-model.int8.onnx');

      const [vocabInfo, encoderInfo, decoderInfo] = await Promise.all([
        FileSystem.getInfoAsync(vocabPath),
        FileSystem.getInfoAsync(encoderPath),
        FileSystem.getInfoAsync(decoderPath),
      ]);
      if (!vocabInfo.exists || !encoderInfo.exists || !decoderInfo.exists) {
        console.warn('[Parakeet] required files missing');
        return false;
      }

      console.log('[Parakeet] files present, creating tokenizer and ONNX sessions');
      const config = await readConfigOrDefault();
      const [tokenizer, encoderSession, decoderSession] = await Promise.all([
        ParakeetTokenizer.fromFile(vocabPath, config.blankId),
        OrtSession.create(encoderPath),
        OrtSession.create(decoderPath),
      ]);

      runtime = new ParakeetOrtRuntime(
        encoderSession,
        decoderSession,
        tokenizer,
        config
      );
      console.log('[Parakeet] init complete');
      return true;
    } catch (error) {
      console.warn('[Parakeet] init failed:', error);
      runtime = null;
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export function isParakeetReady() {
  return runtime !== null;
}

export async function transcribeWithParakeet(audioUri: string) {
  const result = await transcribeWithParakeetDetailed(audioUri);
  return result.text;
}

export async function transcribeWithParakeetDetailed(
  audioUri: string
): Promise<ParakeetTranscriptionResult> {
  const ready = await initParakeetRuntime();
  if (!ready || !runtime) {
    throw new Error('Parakeet runtime is not ready');
  }

  const normalizedUri = audioUri.startsWith('file://')
    ? audioUri
    : `file://${audioUri}`;
  const bytes = await readBinaryFile(normalizedUri);

  const audio = parseWavToFloat32(bytes, STT_SAMPLE_RATE);
  return runtime.transcribeDetailed(audio);
}

export async function transcribeAudioBufferWithParakeetDetailed(
  audio: Float32Array
): Promise<ParakeetTranscriptionResult> {
  const ready = await initParakeetRuntime();
  if (!ready || !runtime) {
    throw new Error('Parakeet runtime is not ready');
  }

  return runtime.transcribeDetailed(audio);
}

export function disposeParakeetRuntime() {
  runtime?.dispose();
  runtime = null;
  initPromise = null;
}
