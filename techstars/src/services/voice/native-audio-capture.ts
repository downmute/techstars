import { NativeEventEmitter, NativeModules, Platform } from "react-native";

export interface NativeAudioChunkEvent {
	pcm16Base64: string;
	frameCount: number;
	sampleRate: number;
}

type NativeAudioCaptureModule = {
	start: () => Promise<void>;
	stop: () => Promise<void>;
};

const moduleName = "VelaNativeAudioCapture";
const nativeModule = NativeModules[moduleName] as
	| NativeAudioCaptureModule
	| undefined;
const emitter =
	Platform.OS === "ios" && nativeModule
		? new NativeEventEmitter(nativeModule as never)
		: null;

export function isNativeAudioCaptureAvailable(): boolean {
	return Platform.OS === "ios" && Boolean(nativeModule);
}

export async function startNativeAudioCapture(): Promise<void> {
	if (!nativeModule) {
		throw new Error("Native iOS audio capture is unavailable");
	}
	await nativeModule.start();
}

export async function stopNativeAudioCapture(): Promise<void> {
	if (!nativeModule) {
		return;
	}
	await nativeModule.stop();
}

export function addNativeAudioChunkListener(
	listener: (event: NativeAudioChunkEvent) => void,
): { remove(): void } {
	if (!emitter) {
		return { remove() {} };
	}

	const subscription = emitter.addListener("onAudioChunk", listener);
	return {
		remove() {
			subscription.remove();
		},
	};
}

export function addNativeAudioStateListener(
	listener: (event: Record<string, unknown>) => void,
): { remove(): void } {
	if (!emitter) {
		return { remove() {} };
	}

	const subscription = emitter.addListener("onAudioState", listener);
	return {
		remove() {
			subscription.remove();
		},
	};
}
