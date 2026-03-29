import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { initSTT } from "@/services/voice/stt-engine";
import { initTTS } from "@/services/voice/tts-engine";
import {
	cancelTurn,
	runVoiceWelcome,
	startListening,
	stopListening,
} from "@/services/voice/voice-pipeline";

let initialized = false;
let initPromise: Promise<void> | null = null;
let activeWelcomePromise: Promise<void> | null = null;

async function initPipeline() {
	if (initialized) {
		return;
	}
	if (initPromise) {
		await initPromise;
		return;
	}

	initPromise = (async () => {
		await Promise.all([initSTT(), initTTS()]);
		initialized = true;
	})();

	try {
		await initPromise;
	} finally {
		initPromise = null;
	}
}

export function useVoicePipeline() {
	const [isListening, setIsListening] = useState(false);
	const [isPreparing, setIsPreparing] = useState(true);
	const hasWelcomedRef = useRef(false);

	useFocusEffect(
		useCallback(() => {
			let cancelled = false;

			async function prepare() {
				setIsPreparing(true);
				await initPipeline();
				if (!cancelled) {
					setIsPreparing(false);
					if (!hasWelcomedRef.current) {
						hasWelcomedRef.current = true;
						try {
							if (!activeWelcomePromise) {
								activeWelcomePromise = runVoiceWelcome().finally(() => {
									activeWelcomePromise = null;
								});
							}
							await activeWelcomePromise;
						} catch {
							// If the proactive opener fails, still start passive listening.
						}
					}
					if (!cancelled) {
						await startListening();
						if (!cancelled) {
							setIsListening(true);
						}
					}
				}
			}

			void prepare();

			return () => {
				cancelled = true;
				hasWelcomedRef.current = false;
				setIsListening(false);
				setIsPreparing(false);
				void stopListening();
			};
		}, []),
	);

	async function handleStartListening() {
		if (isPreparing) {
			return;
		}
		await startListening();
		setIsListening(true);
	}

	async function handleStopListening() {
		await stopListening();
		setIsListening(false);
	}

	function handleCancelTurn() {
		cancelTurn();
	}

	return {
		isListening,
		isPreparing,
		startListening: handleStartListening,
		stopListening: handleStopListening,
		cancelTurn: handleCancelTurn,
	};
}
