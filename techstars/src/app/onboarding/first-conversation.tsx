import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModelDownloadProgress } from "@/components/onboarding/model-download-progress";
import { VelaOrb } from "@/components/orb/vela-orb";
import { Fonts } from "@/constants/theme";
import { ReEntryColors } from "@/constants/vela-colors";
import {
	areAllModelsDownloaded,
	clearDownloadedModels,
	type DownloadProgress,
	downloadAllModels,
} from "@/services/models/model-manager";
import {
	saveUserProfile,
	signInAnonymously,
} from "@/services/supabase/user-service";
import {
	disposePocketTTSRuntime,
	isPocketTTSReady,
} from "@/services/voice/pocket-tts-runtime";
import {
	disposeSileroVadRuntime,
	initSileroVadRuntime,
} from "@/services/voice/silero-vad-runtime";
import { initSTT, resetSTT } from "@/services/voice/stt-engine";
import { initTTS, speak } from "@/services/voice/tts-engine";
import { getCurrentWeeksPostpartum, useAppStore } from "@/state/app-state";
import { useOrbStore } from "@/state/orb-state";

type Phase = "checking" | "downloading" | "preparing" | "greeting";
const RUNTIME_INIT_TIMEOUT_MS = 120000;

async function withTimeout<T>(
	promise: Promise<T>,
	label: string,
	timeoutMs: number,
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(
				new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`),
			);
		}, timeoutMs);

		promise.then(
			(value) => {
				clearTimeout(timeoutId);
				resolve(value);
			},
			(error) => {
				clearTimeout(timeoutId);
				reject(error);
			},
		);
	});
}

function buildGreeting(
	userName: string,
	memories: {
		hometown: string;
		favoriteThings: string;
		importantPerson: string;
	},
): string {
	const details = [
		memories.hometown.trim()
			? `You grew up in ${memories.hometown.trim()}.`
			: null,
		memories.favoriteThings.trim()
			? `You love ${memories.favoriteThings.trim()}.`
			: null,
		memories.importantPerson.trim()
			? `${memories.importantPerson.trim()} matters a lot to you.`
			: null,
	].filter(Boolean);

	const detailSentence =
		details.length > 0 ? ` ${details.slice(0, 2).join(" ")}` : "";

	return `Hi ${userName}. I'm Vela. It's lovely to meet you.${detailSentence} Just tap me whenever you'd like to chat.`;
}

export default function FirstConversationScreen() {
	const [phase, setPhase] = useState<Phase>("checking");
	const [progress, setProgress] = useState<DownloadProgress | null>(null);
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const [retryNonce, setRetryNonce] = useState(0);
	const cancelRef = useRef({ cancelled: false });
	const runStartedRef = useRef(false);

	const userName = useAppStore((s) => s.userName);
	const onboardingMemories = useAppStore((s) => s.onboardingMemories);
	const setModelsDownloaded = useAppStore((s) => s.setModelsDownloaded);
	const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
	const setSupabaseUserId = useAppStore((s) => s.setSupabaseUserId);
	const setOrbState = useOrbStore((s) => s.setState);

	const weeksPostpartum = useAppStore((s) => getCurrentWeeksPostpartum(s));
	const deliveryType = useAppStore((s) => s.deliveryType);
	const feedingMethod = useAppStore((s) => s.feedingMethod);
	const clinicCode = useAppStore((s) => s.clinicCode);
	const returnToWorkDate = useAppStore((s) => s.returnToWorkDate);
	const workSetup = useAppStore((s) => s.workSetup);

	useEffect(() => {
		async function prepareLocalVoice(): Promise<boolean> {
			resetSTT();
			disposePocketTTSRuntime();
			disposeSileroVadRuntime();
			console.log("[Onboarding] Preparing local STT runtime...");
			const sttReady = await withTimeout(
				initSTT(),
				"Parakeet init",
				RUNTIME_INIT_TIMEOUT_MS,
			);
			console.log(`[Onboarding] Parakeet ready: ${String(sttReady)}`);

			console.log("[Onboarding] Preparing local VAD runtime...");
			const vadReady = await withTimeout(
				initSileroVadRuntime(),
				"Silero VAD init",
				RUNTIME_INIT_TIMEOUT_MS,
			);
			console.log(`[Onboarding] Silero VAD ready: ${String(vadReady)}`);

			console.log("[Onboarding] Preparing local TTS runtime...");
			const ttsReady = await withTimeout(
				initTTS().then(() => isPocketTTSReady()),
				"PocketTTS init",
				RUNTIME_INIT_TIMEOUT_MS,
			);
			console.log(`[Onboarding] PocketTTS ready: ${String(ttsReady)}`);

			return sttReady && vadReady && ttsReady;
		}

		async function startGreeting() {
			setPhase("greeting");
			setOrbState("idle");

			await new Promise((r) => setTimeout(r, 800));

			const greeting = userName
				? buildGreeting(userName, onboardingMemories)
				: "Hi there. I'm Vela. It's wonderful to meet you. Just tap me whenever you'd like to chat.";

			setOrbState("speaking");
			await speak(greeting);
			setOrbState("idle");
		}

		async function checkAndDownload() {
			if (runStartedRef.current) {
				console.log(
					"[Onboarding] Setup already in progress, skipping duplicate run",
				);
				return;
			}
			runStartedRef.current = true;
			setOrbState("checkin");

			const alreadyDownloaded = await areAllModelsDownloaded();
			if (alreadyDownloaded) {
				setModelsDownloaded(true);
				setPhase("preparing");
				let ready = false;
				try {
					ready = await prepareLocalVoice();
				} catch (error) {
					console.warn("[Onboarding] Local runtime preparation failed:", error);
				}
				if (!ready) {
					await clearDownloadedModels();
					setModelsDownloaded(false);
					setDownloadError(
						"Your local voice models did not initialize correctly. Tap to redownload them.",
					);
					setOrbState("error");
					return;
				}
				await startGreeting();
				return;
			}

			setPhase("downloading");
			const result = await downloadAllModels(
				(p) => setProgress(p),
				cancelRef.current,
			);

			if (!result.success) {
				setDownloadError(result.error ?? "Download failed");
				setOrbState("error");
				return;
			}

			setModelsDownloaded(true);
			setPhase("preparing");
			let ready = false;
			try {
				ready = await prepareLocalVoice();
			} catch (error) {
				console.warn("[Onboarding] Local runtime preparation failed:", error);
			}
			if (!ready) {
				await clearDownloadedModels();
				setModelsDownloaded(false);
				setDownloadError(
					"Your local voice models did not initialize correctly. Tap to redownload them.",
				);
				setOrbState("error");
				return;
			}
			await startGreeting();
		}

		void checkAndDownload();
		return () => {
			cancelRef.current.cancelled = true;
			runStartedRef.current = false;
		};
	}, [
		onboardingMemories,
		retryNonce,
		setModelsDownloaded,
		setOnboardingComplete,
		setOrbState,
		userName,
	]);

	async function handleStartCheckIn() {
		// Sign in anonymously and persist the profile — non-blocking if offline
		try {
			const userId = await signInAnonymously();
			if (userId) {
				setSupabaseUserId(userId);
				await saveUserProfile(userId, {
					clinicCode,
					weeksPostpartum,
					deliveryType,
					feedingMethod,
					returnToWorkDate,
					workSetup,
				});
			}
		} catch (error) {
			console.warn(
				"[Onboarding] Supabase sync failed, continuing offline:",
				error,
			);
		}
		setOnboardingComplete(true);
		router.replace("/(conversation)");
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{phase === "downloading" ? (
					<View style={styles.centerArea}>
						<VelaOrb />
						<ModelDownloadProgress progress={progress} />
						<Animated.View
							entering={FadeIn.duration(400)}
							style={styles.textArea}
						>
							<Text style={styles.phaseTitle}>Setting things up</Text>
							<Text style={styles.phaseBody}>
								Downloading the local voice tools that make conversations feel
								fast and natural.
							</Text>
						</Animated.View>
					</View>
				) : phase === "preparing" ? (
					<View style={styles.centerArea}>
						<VelaOrb />
						<Animated.View
							entering={FadeIn.duration(400)}
							style={styles.textArea}
						>
							<Text style={styles.phaseTitle}>Preparing your experience</Text>
							<Text style={styles.phaseBody}>
								Finishing local setup so speech stays on-device and feels fast.
							</Text>
						</Animated.View>
					</View>
				) : phase === "greeting" ? (
					<View style={styles.greetingArea}>
						<View style={styles.greetingGlow} />
						<VelaOrb />
						<Animated.View
							entering={FadeInDown.delay(400).duration(600)}
							style={styles.greetingTextArea}
						>
							<Text style={styles.greetingTitle}>You&apos;re all set</Text>
							<Text style={styles.greetingBody}>
								Your recovery journey starts now.{"\n"}We&apos;re here every
								step.
							</Text>
						</Animated.View>
						<Animated.View entering={FadeInDown.delay(800).duration(500)}>
							<Pressable style={styles.startBtn} onPress={handleStartCheckIn}>
								<Text style={styles.startBtnText}>
									Start your first check-in
								</Text>
							</Pressable>
						</Animated.View>
					</View>
				) : downloadError ? (
					<View style={styles.errorArea}>
						<Text style={styles.errorTitle}>Download failed</Text>
						<Text style={styles.errorBody}>{downloadError}</Text>
						<Pressable
							style={styles.retryBtn}
							onPress={() => {
								setDownloadError(null);
								cancelRef.current = { cancelled: false };
								setProgress(null);
								setPhase("checking");
								setRetryNonce((value) => value + 1);
							}}
						>
							<Text style={styles.retryText}>Tap to retry</Text>
						</Pressable>
					</View>
				) : (
					<VelaOrb />
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: ReEntryColors.background },
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	centerArea: {
		alignItems: "center",
		justifyContent: "center",
		gap: 0,
	},
	textArea: {
		width: "100%",
		paddingHorizontal: 32,
		marginTop: 24,
		alignItems: "center",
	},
	phaseTitle: {
		fontFamily: Fonts?.serif,
		fontSize: 24,
		fontWeight: "600",
		color: ReEntryColors.textPrimary,
		textAlign: "center",
		marginBottom: 8,
	},
	phaseBody: {
		fontFamily: Fonts?.sans,
		fontSize: 15,
		color: ReEntryColors.textSecondary,
		textAlign: "center",
		lineHeight: 22,
	},
	greetingArea: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 24,
		paddingHorizontal: 32,
	},
	greetingGlow: {
		position: "absolute",
		width: 340,
		height: 340,
		borderRadius: 170,
		backgroundColor: "rgba(232,196,184,0.25)",
		top: "25%",
	},
	greetingTextArea: {
		alignItems: "center",
		marginTop: 8,
	},
	greetingTitle: {
		fontFamily: Fonts?.serif,
		fontSize: 44,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		textAlign: "center",
		marginBottom: 12,
	},
	greetingBody: {
		fontFamily: Fonts?.sans,
		fontSize: 17,
		color: ReEntryColors.textSecondary,
		textAlign: "center",
		lineHeight: 25,
	},
	startBtn: {
		backgroundColor: ReEntryColors.textPrimary,
		borderRadius: 999,
		paddingVertical: 18,
		paddingHorizontal: 48,
		marginTop: 16,
	},
	startBtnText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.white,
		fontSize: 16,
		fontWeight: "600",
	},
	errorArea: {
		alignItems: "center",
		paddingHorizontal: 36,
		gap: 16,
	},
	errorTitle: {
		fontFamily: Fonts?.serif,
		fontSize: 24,
		fontWeight: "600",
		color: ReEntryColors.danger,
	},
	errorBody: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.textSecondary,
		fontSize: 15,
		textAlign: "center",
		lineHeight: 22,
	},
	retryBtn: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		marginTop: 8,
	},
	retryText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.primary,
		fontSize: 16,
		fontWeight: "600",
	},
});
