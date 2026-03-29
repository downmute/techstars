import * as FileSystem from "expo-file-system/legacy";

export const TTS_SAMPLE_RATE = 24000;
export const STT_SAMPLE_RATE = 16000;

export function decodeBase64ToBytes(base64: string): Uint8Array {
	if (typeof atob === "function") {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i += 1) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	}

	const maybeBuffer = (globalThis as { Buffer?: typeof Buffer }).Buffer;
	if (maybeBuffer) {
		return new Uint8Array(maybeBuffer.from(base64, "base64"));
	}

	throw new Error("Base64 decode is not supported in this runtime.");
}

export function encodeBase64FromBytes(bytes: Uint8Array): string {
	let binary = "";
	const chunkSize = 0x8000;

	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
		binary += String.fromCharCode(...chunk);
	}

	if (typeof btoa === "function") {
		return btoa(binary);
	}

	const maybeBuffer = (globalThis as { Buffer?: typeof Buffer }).Buffer;
	if (maybeBuffer) {
		return maybeBuffer.from(binary, "binary").toString("base64");
	}

	throw new Error("Base64 encode is not supported in this runtime.");
}

export async function readBinaryFile(path: string): Promise<Uint8Array> {
	const base64 = await FileSystem.readAsStringAsync(path, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return decodeBase64ToBytes(base64);
}

export function resampleLinear(
	input: Float32Array,
	fromRate: number,
	toRate: number,
): Float32Array {
	if (fromRate === toRate) {
		return input;
	}

	const ratio = fromRate / toRate;
	const outputLength = Math.max(1, Math.floor(input.length / ratio));
	const output = new Float32Array(outputLength);

	for (let i = 0; i < outputLength; i += 1) {
		const position = i * ratio;
		const lower = Math.floor(position);
		const upper = Math.min(lower + 1, input.length - 1);
		const fraction = position - lower;
		output[i] = input[lower]! * (1 - fraction) + input[upper]! * fraction;
	}

	return output;
}

export function parseWavToFloat32(
	bytes: Uint8Array,
	targetSampleRate?: number,
): Float32Array {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let audioFormat = 1;
	let numChannels = 1;
	let sampleRate = STT_SAMPLE_RATE;
	let bitsPerSample = 16;
	let dataOffset = 0;
	let dataSize = 0;
	let position = 12;

	while (position + 8 <= bytes.byteLength) {
		const chunkId = String.fromCharCode(
			bytes[position]!,
			bytes[position + 1]!,
			bytes[position + 2]!,
			bytes[position + 3]!,
		);
		const chunkSize = view.getUint32(position + 4, true);
		position += 8;

		if (chunkId === "fmt ") {
			audioFormat = view.getUint16(position, true);
			numChannels = view.getUint16(position + 2, true);
			sampleRate = view.getUint32(position + 4, true);
			bitsPerSample = view.getUint16(position + 14, true);
		} else if (chunkId === "data") {
			dataOffset = position;
			dataSize = chunkSize;
			break;
		}

		position += chunkSize + (chunkSize & 1);
	}

	if (dataOffset === 0) {
		throw new Error("WAV data chunk not found");
	}

	const bytesPerSample = bitsPerSample / 8;
	const frameSize = bytesPerSample * numChannels;
	const frameCount = Math.floor(dataSize / frameSize);
	const output = new Float32Array(frameCount);

	for (let i = 0; i < frameCount; i += 1) {
		const offset = dataOffset + i * frameSize;

		if (bitsPerSample === 16) {
			output[i] = view.getInt16(offset, true) / 32768;
		} else if (bitsPerSample === 32 && audioFormat === 3) {
			output[i] = view.getFloat32(offset, true);
		} else {
			throw new Error(
				`Unsupported WAV format: ${audioFormat}/${bitsPerSample}`,
			);
		}
	}

	if (!targetSampleRate || targetSampleRate === sampleRate) {
		return output;
	}

	return resampleLinear(output, sampleRate, targetSampleRate);
}

export function float32ToWavBytes(
	audio: Float32Array,
	sampleRate: number,
): Uint8Array {
	const channelCount = 1;
	const bitsPerSample = 16;
	const blockAlign = (channelCount * bitsPerSample) / 8;
	const byteRate = sampleRate * blockAlign;
	const dataSize = audio.length * blockAlign;
	const buffer = new ArrayBuffer(44 + dataSize);
	const view = new DataView(buffer);

	function writeAscii(offset: number, value: string) {
		for (let i = 0; i < value.length; i += 1) {
			view.setUint8(offset + i, value.charCodeAt(i));
		}
	}

	writeAscii(0, "RIFF");
	view.setUint32(4, 36 + dataSize, true);
	writeAscii(8, "WAVE");
	writeAscii(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channelCount, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, byteRate, true);
	view.setUint16(32, blockAlign, true);
	view.setUint16(34, bitsPerSample, true);
	writeAscii(36, "data");
	view.setUint32(40, dataSize, true);

	let offset = 44;
	for (let i = 0; i < audio.length; i += 1) {
		const sample = Math.max(-1, Math.min(1, audio[i]!));
		const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
		view.setInt16(offset, Math.round(pcm), true);
		offset += 2;
	}

	return new Uint8Array(buffer);
}

export function pcm16BytesToFloat32(bytes: Uint8Array): Float32Array {
	const sampleCount = Math.floor(bytes.byteLength / 2);
	const output = new Float32Array(sampleCount);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

	for (let i = 0; i < sampleCount; i += 1) {
		output[i] = view.getInt16(i * 2, true) / 32768;
	}

	return output;
}

export function decodeBase64Pcm16ToFloat32(base64: string): Float32Array {
	return pcm16BytesToFloat32(decodeBase64ToBytes(base64));
}

export function estimateAmplitudeFrames(
	audio: Float32Array,
	windowSize = 1024,
): Float32Array {
	if (audio.length === 0) {
		return new Float32Array(0);
	}

	const frameCount = Math.ceil(audio.length / windowSize);
	const amplitudes = new Float32Array(frameCount);

	for (let frame = 0; frame < frameCount; frame += 1) {
		const start = frame * windowSize;
		const end = Math.min(start + windowSize, audio.length);
		let sum = 0;

		for (let i = start; i < end; i += 1) {
			const sample = audio[i]!;
			sum += sample * sample;
		}

		amplitudes[frame] = Math.min(
			1,
			Math.sqrt(sum / Math.max(1, end - start)) * 4,
		);
	}

	return amplitudes;
}
