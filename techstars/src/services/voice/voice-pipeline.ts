/**
 * Voice Pipeline Orchestrator
 *
 * Passive loop:
 *   always-on slice recording -> local STT accumulation -> Parakeet EOU / punctuation
 *   -> Groq streaming text -> sentence-buffered TTS -> resume listening
 */

import { Platform } from "react-native";
import { getLocalDateKey } from "@/lib/date-utils";
import { type ChatMessage, streamChat } from "@/services/llm/groq-client";
import { buildSystemPrompt } from "@/services/llm/system-prompt";
import { getTopMemories } from "@/services/memory/memory-store";
import { useAppStore } from "@/state/app-state";
import { useConversationStore } from "@/state/conversation-state";
import { useOrbStore } from "@/state/orb-state";
import {
	ensureSurveyStoreHydrated,
	buildAggregatedSurveyHistory,
	aggregateSurveyScores,
	formatRecentSurveyContext,
	surveyCategories,
	useSurveyStore,
	type SurveyHistory,
	type SurveyCategory,
	type SurveyScores,
} from "@/state/survey-state";
import { useVoiceStore } from "@/state/voice-state";
import { evaluateVoiceWellbeing } from "./voice-wellbeing-evaluator";
import {
	cancelRecording,
	startRecording,
	stopRecording,
} from "./audio-recorder";
import {
	addNativeAudioChunkListener,
	addNativeAudioStateListener,
	isNativeAudioCaptureAvailable,
	startNativeAudioCapture,
	stopNativeAudioCapture,
} from "./native-audio-capture";
import {
	createSileroVadStream,
	initSileroVadRuntime,
	isSileroVadReady,
	type SileroVadFrameResult,
	type SileroVadStream,
} from "./silero-vad-runtime";
import {
	transcribeAudioBufferDetailed,
	transcribeDetailed,
} from "./stt-engine";
import {
	playSpeechAudio,
	speak,
	stopSpeaking,
	synthesizeSpeechAudio,
} from "./tts-engine";
import { decodeBase64Pcm16ToFloat32, STT_SAMPLE_RATE } from "./wav-utils";

export type PipelineState = "idle" | "recording" | "processing" | "speaking";

const RECORDING_SLICE_MS = 2200;
const PASSIVE_LOOP_POLL_MS = 140;
const MIN_SPEECH_LENGTH = 2;
const MIN_SILENCE_METERING = -45;
const EMPTY_SLICES_BEFORE_FLUSH = 2;
const LIVE_FIRST_DECODE_SAMPLES = Math.floor(STT_SAMPLE_RATE * 0.45);
const LIVE_MIN_TRANSCRIBE_SAMPLES = Math.floor(STT_SAMPLE_RATE * 0.18);
const LIVE_MAX_UTTERANCE_SAMPLES = STT_SAMPLE_RATE * 12;
const LIVE_SILENCE_FLUSH_MS = 1200;
const LIVE_DECODE_INTERVAL_SAMPLES = Math.floor(STT_SAMPLE_RATE * 0.28);
const LIVE_PRE_ROLL_SAMPLES = Math.floor(STT_SAMPLE_RATE * 0.12);
const LIVE_MIN_DECODE_INTERVAL_MS = 320;
const LIVE_EOU_SILENCE_CONFIRM_MS = 350;
const LIVE_EOU_STABILITY_MS = 650;
const LIVE_PERSISTENT_EOU_FLUSH_MS = 1200;
const LIVE_PERSISTENT_EOU_MIN_WORDS = 3;
const VOICE_WELCOME_DEBOUNCE_MS = 8000;

let currentState: PipelineState = "idle";
let passiveListeningEnabled = false;
let passiveLoopPromise: Promise<void> | null = null;
let pendingTranscript = "";
let emptySliceCount = 0;
let turnGeneration = 0;
let sliceCounter = 0;
let nativeChunkSubscription: { remove(): void } | null = null;
let nativeStateSubscription: { remove(): void } | null = null;
let liveAudioChunks: Float32Array[] = [];
let liveAudioSampleCount = 0;
let liveLastVoiceAt = 0;
let liveTranscribePromise: Promise<void> | null = null;
let nativeCaptureStarted = false;
let liveSpeechActive = false;
let liveFinalizeTimer: ReturnType<typeof setTimeout> | null = null;
let liveLastDecodeSampleCount = 0;
let livePreRollChunks: Float32Array[] = [];
let livePreRollSampleCount = 0;
let liveVadStream: SileroVadStream | null = null;
let liveChunkQueue: Promise<void> = Promise.resolve();
let liveParakeetStarted = false;
let liveLastDecodeAt = 0;
let liveEouCandidateTranscript = "";
let liveEouCandidateCount = 0;
let liveFirstEouAt = 0;
let lastVoiceWelcomeStartedAt = 0;

interface WellbeingContextSnapshot {
	aggregatedHistory: SurveyHistory;
	todaySelfScores: SurveyScores | undefined;
	todayAiScores: SurveyScores | undefined;
	todayAggregatedScores: SurveyScores;
	priorityDomain: SurveyCategory | null;
	shouldAcknowledgeCompletion: boolean;
}

type WellbeingEvaluationResult = {
	evaluationId: number;
	todayKey: string;
	aiEvaluation: Awaited<ReturnType<typeof evaluateVoiceWellbeing>>;
};

let pendingWellbeingEvaluationPromise:
	| Promise<WellbeingEvaluationResult | null>
	| null = null;
let latestWellbeingEvaluationId = 0;
let latestAppliedWellbeingEvaluationId = 0;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getState() {
	return currentState;
}

function setState(state: PipelineState) {
	currentState = state;

	const orbStore = useOrbStore.getState();
	const voiceStore = useVoiceStore.getState();

	switch (state) {
		case "idle":
			orbStore.setState("idle");
			voiceStore.setIsRecording(false);
			voiceStore.setIsSpeaking(false);
			voiceStore.setAmplitude(0);
			break;
		case "recording":
			orbStore.setState("listening");
			voiceStore.setIsRecording(true);
			voiceStore.setIsSpeaking(false);
			break;
		case "processing":
			orbStore.setState("processing");
			voiceStore.setIsRecording(false);
			voiceStore.setIsSpeaking(false);
			break;
		case "speaking":
			orbStore.setState("speaking");
			voiceStore.setIsRecording(false);
			voiceStore.setIsSpeaking(true);
			break;
	}
}

function normalizeWhitespace(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

function formatScoreBucketLabel(category: SurveyCategory): string {
	switch (category) {
		case "moodDepression":
			return "mood";
		case "anxiety":
			return "worry";
		case "sleepFatigue":
			return "sleep";
		case "physicalRecovery":
			return "physical recovery";
		case "socialSupport":
			return "support";
	}
}

function formatScoreSnapshot(scores: SurveyScores | null | undefined): string {
	if (!scores) {
		return "none";
	}

	const parts = Object.entries(scores)
		.filter(([, value]) => typeof value === "number")
		.map(([key, value]) => `${key}=${Math.round(value as number)}`);
	return parts.length > 0 ? parts.join(", ") : "none";
}

function pickPriorityDomain(
	selfScores: SurveyScores | undefined,
	aiScores: SurveyScores | undefined,
	aggregatedScores: SurveyScores,
	suggestedFocus: SurveyCategory | null,
): SurveyCategory | null {
	if (suggestedFocus) {
		return suggestedFocus;
	}

	const missingSelf = surveyCategories.find((category) => {
		const value = selfScores?.[category];
		return typeof value !== "number" || !Number.isFinite(value);
	});
	if (missingSelf) {
		return missingSelf;
	}

	const missingAi = surveyCategories.find((category) => {
		const value = aiScores?.[category];
		return typeof value !== "number" || !Number.isFinite(value);
	});
	if (missingAi) {
		return missingAi;
	}

	return surveyCategories.reduce<SurveyCategory | null>((lowest, category) => {
		const value = aggregatedScores[category];
		if (typeof value !== "number" || !Number.isFinite(value)) {
			return lowest;
		}
		if (!lowest) {
			return category;
		}
		return (aggregatedScores[lowest] ?? 101) > value ? category : lowest;
	}, null);
}

function getStoredWellbeingContext(
	todayKey: string,
	suggestedFocus: SurveyCategory | null,
): WellbeingContextSnapshot {
	const surveyState = useSurveyStore.getState();
	const aggregatedHistory = buildAggregatedSurveyHistory(
		surveyState.surveyHistory,
		surveyState.aiSurveyHistory,
	);
	const todaySelfScores = surveyState.surveyHistory[todayKey];
	const todayAiScores = surveyState.aiSurveyHistory[todayKey];
	const todayAggregatedScores = aggregateSurveyScores(
		todaySelfScores,
		todayAiScores,
	);
	const priorityDomain = pickPriorityDomain(
		todaySelfScores,
		todayAiScores,
		todayAggregatedScores,
		suggestedFocus,
	);
	const assessmentStatus = surveyState.aiAssessmentStatus[todayKey];

	return {
		aggregatedHistory,
		todaySelfScores,
		todayAiScores,
		todayAggregatedScores,
		priorityDomain,
		shouldAcknowledgeCompletion: Boolean(
			assessmentStatus?.complete && !assessmentStatus.acknowledged,
		),
	};
}

function persistVoiceWellbeingEvaluation(
	todayKey: string,
	aiEvaluation: Awaited<ReturnType<typeof evaluateVoiceWellbeing>>,
) {
	if (!aiEvaluation) {
		return;
	}

	const surveyState = useSurveyStore.getState();
	if (Object.keys(aiEvaluation.scores).length > 0) {
		surveyState.upsertAiSurveyScores(todayKey, aiEvaluation.scores);
	}
	surveyState.setAiAssessmentStatus(todayKey, {
		complete: aiEvaluation.allScoresReady,
	});
}

function applyWellbeingEvaluationResult(
	result: WellbeingEvaluationResult | null,
) {
	if (!result) {
		return;
	}
	if (result.evaluationId <= latestAppliedWellbeingEvaluationId) {
		return;
	}
	latestAppliedWellbeingEvaluationId = result.evaluationId;
	persistVoiceWellbeingEvaluation(result.todayKey, result.aiEvaluation);
}

function startVoiceWellbeingEvaluation(args: {
	todayKey: string;
	messages: Parameters<typeof evaluateVoiceWellbeing>[0]["messages"];
	selfReportedScores?: SurveyScores | null;
	currentAggregatedScores?: SurveyScores | null;
	recentAggregatedHistory?: SurveyHistory | null;
}) {
	const evaluationId = ++latestWellbeingEvaluationId;
	const evaluationPromise = evaluateVoiceWellbeing({
		messages: args.messages,
		selfReportedScores: args.selfReportedScores,
		currentAggregatedScores: args.currentAggregatedScores,
		recentAggregatedHistory: args.recentAggregatedHistory,
	})
		.then((aiEvaluation) => ({
			evaluationId,
			todayKey: args.todayKey,
			aiEvaluation,
		}))
		.catch((error) => {
			console.warn("[VoiceEval] background scoring failed:", error);
			return null;
		})
		.then((result) => {
			applyWellbeingEvaluationResult(result);
			return result;
		})
		.finally(() => {
			if (pendingWellbeingEvaluationPromise === evaluationPromise) {
				pendingWellbeingEvaluationPromise = null;
			}
		});

	pendingWellbeingEvaluationPromise = evaluationPromise;
	return evaluationPromise;
}

async function flushPendingWellbeingEvaluation(todayKey?: string): Promise<void> {
	const pendingPromise = pendingWellbeingEvaluationPromise;
	if (!pendingPromise) {
		return;
	}

	const result = await pendingPromise;
	if (todayKey && result && result.todayKey !== todayKey) {
		return;
	}
	applyWellbeingEvaluationResult(result);
}

function tokenizeTranscript(text: string): string[] {
	return normalizeWhitespace(
		text
			.toLowerCase()
			.replace(/[^a-z0-9'\s]/g, " ")
			.replace(/\b(coffy|cofee|cofey)\b/g, "coffee")
			.replace(/\b(drinky|drinke)\b/g, "drink"),
	)
		.split(" ")
		.filter(Boolean);
}

function collapseRepeatedWords(words: string[]): string[] {
	const collapsed: string[] = [];
	for (const word of words) {
		if (collapsed[collapsed.length - 1] !== word) {
			collapsed.push(word);
		}
	}
	return collapsed;
}

function countCommonSuffixWords(a: string[], b: string[]): number {
	let count = 0;
	let ai = a.length - 1;
	let bi = b.length - 1;

	while (ai >= 0 && bi >= 0 && a[ai] === b[bi]) {
		count += 1;
		ai -= 1;
		bi -= 1;
	}

	return count;
}

function areEouCandidatesCompatible(previous: string, next: string): boolean {
	const prevWords = collapseRepeatedWords(tokenizeTranscript(previous));
	const nextWords = collapseRepeatedWords(tokenizeTranscript(next));

	if (prevWords.length === 0 || nextWords.length === 0) {
		return false;
	}

	const prevJoined = prevWords.join(" ");
	const nextJoined = nextWords.join(" ");
	if (
		prevJoined === nextJoined ||
		prevJoined.includes(nextJoined) ||
		nextJoined.includes(prevJoined)
	) {
		return true;
	}

	const commonSuffixWords = countCommonSuffixWords(prevWords, nextWords);
	return (
		commonSuffixWords >= 3 ||
		(commonSuffixWords >= 2 &&
			Math.abs(prevWords.length - nextWords.length) <= 2)
	);
}

function pickPreferredEouTranscript(previous: string, next: string): string {
	if (!previous) {
		return next;
	}

	const previousWords = collapseRepeatedWords(tokenizeTranscript(previous));
	const nextWords = collapseRepeatedWords(tokenizeTranscript(next));

	if (nextWords.length > previousWords.length) {
		return next;
	}
	if (nextWords.length < previousWords.length) {
		return previous;
	}

	return next.length >= previous.length ? next : previous;
}

function hasTerminalPunctuation(text: string): boolean {
	return /[.!?…]["')\]]*\s*$/.test(text.trim());
}

function isMeaningfulText(text: string): boolean {
	return /[a-zA-Z0-9]/.test(text);
}

function mergeTranscript(existing: string, incoming: string): string {
	const cleanExisting = normalizeWhitespace(existing);
	const cleanIncoming = normalizeWhitespace(incoming);

	if (!cleanIncoming) {
		return cleanExisting;
	}
	if (!cleanExisting) {
		return cleanIncoming;
	}
	if (cleanExisting.endsWith(cleanIncoming)) {
		return cleanExisting;
	}

	return `${cleanExisting} ${cleanIncoming}`.trim();
}

function extractCompletedSentences(text: string): {
	completed: string[];
	remainder: string;
} {
	const completed: string[] = [];
	let start = 0;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index]!;
		if (!".!?…".includes(char)) {
			continue;
		}

		let end = index + 1;
		while (end < text.length && `"'”’)]}`.includes(text[end]!)) {
			end += 1;
		}

		const next = text[end];
		if (next && !/\s/.test(next)) {
			continue;
		}

		const sentence = normalizeWhitespace(text.slice(start, end));
		if (sentence) {
			completed.push(sentence);
		}
		start = end;
	}

	return {
		completed,
		remainder: text.slice(start),
	};
}

function handlePipelineError(label: string, error: unknown) {
	console.error(label, error);
	setState("idle");
	useOrbStore.getState().setState("error");
	setTimeout(() => useOrbStore.getState().setState("idle"), 2000);
}

function clearPendingUtterance() {
	pendingTranscript = "";
	emptySliceCount = 0;
}

function resetLiveAudioBuffer() {
	if (liveFinalizeTimer) {
		clearTimeout(liveFinalizeTimer);
		liveFinalizeTimer = null;
	}
	liveAudioChunks = [];
	liveAudioSampleCount = 0;
	liveLastVoiceAt = 0;
	liveTranscribePromise = null;
	liveSpeechActive = false;
	liveLastDecodeSampleCount = 0;
	livePreRollChunks = [];
	livePreRollSampleCount = 0;
	liveParakeetStarted = false;
	liveLastDecodeAt = 0;
	liveEouCandidateTranscript = "";
	liveEouCandidateCount = 0;
	liveFirstEouAt = 0;
}

function concatenateAudioChunks(
	chunks: Float32Array[],
	sampleCount: number,
): Float32Array {
	const merged = new Float32Array(sampleCount);
	let offset = 0;

	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.length;
	}

	return merged;
}

function normalizeAudioForStt(audio: Float32Array): Float32Array {
	if (audio.length === 0) {
		return audio;
	}

	let peak = 0;
	for (let i = 0; i < audio.length; i += 1) {
		peak = Math.max(peak, Math.abs(audio[i]!));
	}

	if (peak <= 0 || peak >= 0.35) {
		return audio;
	}

	const gain = Math.min(18, 0.7 / peak);
	const boosted = new Float32Array(audio.length);
	for (let i = 0; i < audio.length; i += 1) {
		const sample = audio[i]! * gain;
		boosted[i] = Math.max(-1, Math.min(1, sample));
	}

	return boosted;
}

async function ensureNativeCaptureStopped(): Promise<void> {
	if (
		Platform.OS !== "ios" ||
		!isNativeAudioCaptureAvailable() ||
		!nativeCaptureStarted
	) {
		return;
	}

	await stopNativeAudioCapture();
	nativeCaptureStarted = false;
	liveVadStream?.reset();
}

async function ensureNativeCaptureStarted(): Promise<void> {
	if (
		Platform.OS !== "ios" ||
		!isNativeAudioCaptureAvailable() ||
		!passiveListeningEnabled
	) {
		return;
	}
	if (nativeCaptureStarted) {
		return;
	}

	await startNativeAudioCapture();
	nativeCaptureStarted = true;
	setState("recording");
}

async function recordSlice() {
	const sliceId = ++sliceCounter;
	console.log(`[VoicePipeline] slice=${sliceId} start`);
	setState("recording");
	await startRecording();
	await sleep(RECORDING_SLICE_MS);
	const result = await stopRecording();
	console.log(
		`[VoicePipeline] slice=${sliceId} captured durationMs=${result.durationMs} metering=${
			typeof result.metering === "number" ? result.metering.toFixed(1) : "n/a"
		}`,
	);
	return { ...result, sliceId };
}

async function drainSentenceQueue(
	generation: number,
	queue: string[],
	onAmplitude: (amplitude: number) => void,
) {
	let nextPreparedAudio: Promise<Float32Array | null> | null = null;

	while (queue.length > 0) {
		if (generation !== turnGeneration) {
			queue.length = 0;
			return;
		}

		const sentence = normalizeWhitespace(queue.shift() ?? "");
		if (!sentence) {
			continue;
		}

		setState("speaking");
		const currentPreparedAudio =
			nextPreparedAudio ?? synthesizeSpeechAudio(sentence);
		const nextSentence = normalizeWhitespace(queue[0] ?? "");
		nextPreparedAudio = nextSentence
			? synthesizeSpeechAudio(nextSentence)
			: null;

		try {
			const preparedAudio = await currentPreparedAudio;
			if (preparedAudio) {
				await playSpeechAudio(preparedAudio, onAmplitude);
			} else {
				await speak(sentence, onAmplitude);
			}
		} catch (error) {
			console.warn("[VoicePipeline] prefetched PocketTTS audio failed:", error);
			await speak(sentence, onAmplitude);
		}
	}
}

async function streamAssistantReply(messages: ChatMessage[]): Promise<void> {
	const conversationStore = useConversationStore.getState();
	const generation = ++turnGeneration;
	const speechQueue: string[] = [];
	let speechPromise: Promise<void> | null = null;
	let fullResponse = "";
	let sentenceBuffer = "";
	let finalized = false;
	let llmMode: "streaming" | "non-streaming" = "streaming";
	let hasQueuedSpeech = false;

	const maybeStartSpeech = () => {
		if (speechPromise || speechQueue.length === 0) {
			return;
		}

		speechPromise = drainSentenceQueue(generation, speechQueue, (amplitude) => {
			useVoiceStore.getState().setAmplitude(amplitude);
		}).finally(() => {
			speechPromise = null;
			if (
				finalized &&
				speechQueue.length === 0 &&
				generation === turnGeneration
			) {
				setState("idle");
			} else if (speechQueue.length > 0 && generation === turnGeneration) {
				maybeStartSpeech();
			}
		});
	};

	const enqueueCompletedSentences = (bufferText: string) => {
		const { completed, remainder } = extractCompletedSentences(bufferText);
		for (const sentence of completed) {
			if (isMeaningfulText(sentence)) {
				speechQueue.push(sentence);
				hasQueuedSpeech = true;
			}
		}
		sentenceBuffer = remainder;
		maybeStartSpeech();
	};

	await new Promise<void>((resolve, reject) => {
		void streamChat(messages, {
			onMode: (mode) => {
				llmMode = mode;
			},
			onToken: (token) => {
				if (generation !== turnGeneration) {
					return;
				}

				fullResponse += token;
				sentenceBuffer += token;
				conversationStore.updateLastAssistantMessage(fullResponse);
				enqueueCompletedSentences(sentenceBuffer);
			},
			onDone: (text) => {
				if (generation !== turnGeneration) {
					resolve();
					return;
				}

				fullResponse = text || fullResponse;
				if (!normalizeWhitespace(fullResponse)) {
					fullResponse = "I didn't fully catch that. Could you say it one more time?";
				}
				conversationStore.updateLastAssistantMessage(fullResponse);

				if (llmMode === "non-streaming") {
					const fullUtterance = normalizeWhitespace(fullResponse);
					if (fullUtterance && isMeaningfulText(fullUtterance)) {
						speechQueue.length = 0;
						sentenceBuffer = "";
						speechQueue.push(fullUtterance);
						hasQueuedSpeech = true;
						maybeStartSpeech();
					}
				} else {
					const tail = normalizeWhitespace(sentenceBuffer);
					if (tail && isMeaningfulText(tail)) {
						speechQueue.push(tail);
						hasQueuedSpeech = true;
						sentenceBuffer = "";
						maybeStartSpeech();
					} else if (!hasQueuedSpeech) {
						const fallbackUtterance = normalizeWhitespace(fullResponse);
						if (fallbackUtterance && isMeaningfulText(fallbackUtterance)) {
							speechQueue.push(fallbackUtterance);
							hasQueuedSpeech = true;
							sentenceBuffer = "";
							maybeStartSpeech();
						}
					}
				}

				finalized = true;

				if (!speechPromise && speechQueue.length === 0) {
					setState("idle");
				}

				if (!speechPromise) {
					resolve();
					return;
				}

				void speechPromise.finally(() => {
					if (generation === turnGeneration) {
						setState("idle");
					}
					resolve();
				});
			},
			onError: (error) => {
				if (generation !== turnGeneration) {
					resolve();
					return;
				}
				reject(error);
			},
		});
	});
}

async function processTranscript(transcript: string): Promise<void> {
	const cleanTranscript = normalizeWhitespace(transcript);
	if (!isMeaningfulText(cleanTranscript)) {
		setState("idle");
		return;
	}

	await ensureNativeCaptureStopped();

	const { userName } = useAppStore.getState();
	const conversationStore = useConversationStore.getState();
	const todayKey = getLocalDateKey();

	conversationStore.addMessage({ role: "user", text: cleanTranscript });

	const memoriesPromise = getTopMemories(10);
	await ensureSurveyStoreHydrated();
	const surveyState = useSurveyStore.getState();
	const selfReportedScores = surveyState.surveyHistory[todayKey];
	const prePromptWellbeingContext = getStoredWellbeingContext(todayKey, null);
	const wellbeingEvaluationPromise = startVoiceWellbeingEvaluation({
		todayKey,
		messages: [...conversationStore.messages],
		selfReportedScores,
		currentAggregatedScores: prePromptWellbeingContext.todayAggregatedScores,
		recentAggregatedHistory: prePromptWellbeingContext.aggregatedHistory,
	});

	await wellbeingEvaluationPromise;
	const wellbeingContext = getStoredWellbeingContext(todayKey, null);
	const shouldAcknowledgeCompletion =
		wellbeingContext.shouldAcknowledgeCompletion;
	if (shouldAcknowledgeCompletion) {
		useSurveyStore.getState().setAiAssessmentStatus(todayKey, {
			complete: true,
			acknowledged: true,
		});
	}

	const memories = await memoriesPromise;
	const recentSurveyContext = formatRecentSurveyContext(
		wellbeingContext.aggregatedHistory,
	);
	const systemPrompt = buildSystemPrompt(
		userName ?? "friend",
		memories,
		recentSurveyContext,
	);
	const messages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		{
			role: "system",
			content: [
				`Today's self-reported scores: ${formatScoreSnapshot(
					wellbeingContext.todaySelfScores,
				)}.`,
				`Today's AI-evaluated scores: ${formatScoreSnapshot(
					wellbeingContext.todayAiScores,
				)}.`,
				`Today's aggregated wellbeing scores: ${formatScoreSnapshot(
					wellbeingContext.todayAggregatedScores,
				)}.`,
				wellbeingContext.priorityDomain
					? `In this next reply, prioritize deeper exploration of ${formatScoreBucketLabel(
							wellbeingContext.priorityDomain,
						)} with one open-ended question. Do not repeat the survey form wording.`
					: "If all key domains are already well understood, respond naturally without forcing another assessment question.",
				shouldAcknowledgeCompletion
					? "Briefly let the user know you have what you need for today's wellbeing picture, then continue warmly and naturally."
					: "Do not say you are scoring them or mention hidden internal evaluation.",
			].join(" "),
		},
		...conversationStore.messages
			.filter(
				(message) => message.role === "user" || message.role === "assistant",
			)
			.map((message) => ({
				role: message.role as "user" | "assistant",
				content: message.text,
			})),
	];

	conversationStore.addMessage({ role: "assistant", text: "" });
	setState("processing");
	try {
		await streamAssistantReply(messages);
	} finally {
		if (passiveListeningEnabled) {
			await ensureNativeCaptureStarted();
		}
	}
}

async function maybeProcessPendingTurn(): Promise<void> {
	const transcript = normalizeWhitespace(pendingTranscript);
	if (transcript.length < MIN_SPEECH_LENGTH || !isMeaningfulText(transcript)) {
		clearPendingUtterance();
		setState("idle");
		return;
	}

	clearPendingUtterance();
	await processTranscript(transcript);
}

async function flushLiveTranscript(reason: string): Promise<void> {
	const transcript = normalizeWhitespace(pendingTranscript);
	if (!transcript || !isMeaningfulText(transcript)) {
		clearPendingUtterance();
		resetLiveAudioBuffer();
		setState("recording");
		return;
	}

	if (reason === "parakeet-eou") {
		console.log(
			`[Parakeet] EOU detected, submitting transcript="${transcript.slice(0, 160)}"`,
		);
	}
	clearPendingUtterance();
	resetLiveAudioBuffer();
	await processTranscript(transcript);
}

function trimLiveAudioIfNeeded() {
	while (
		liveAudioSampleCount > LIVE_MAX_UTTERANCE_SAMPLES &&
		liveAudioChunks.length > 1
	) {
		const removed = liveAudioChunks.shift();
		if (!removed) {
			break;
		}
		liveAudioSampleCount -= removed.length;
	}
}

function pushLivePreRollChunk(chunk: Float32Array) {
	livePreRollChunks.push(chunk);
	livePreRollSampleCount += chunk.length;

	while (
		livePreRollSampleCount > LIVE_PRE_ROLL_SAMPLES &&
		livePreRollChunks.length > 1
	) {
		const removed = livePreRollChunks.shift();
		if (!removed) {
			break;
		}
		livePreRollSampleCount -= removed.length;
	}
}

function bootstrapLiveAudioBufferFromPreRoll() {
	liveAudioChunks = [...livePreRollChunks];
	liveAudioSampleCount = livePreRollChunks.reduce(
		(sum, chunk) => sum + chunk.length,
		0,
	);
	liveLastDecodeSampleCount = 0;
}

function maybeDecodeLiveUtterance(trigger: "periodic" | "silence") {
	if (!passiveListeningEnabled) {
		return;
	}
	if (currentState === "speaking" || currentState === "processing") {
		return;
	}
	const minSamples = liveParakeetStarted
		? LIVE_MIN_TRANSCRIBE_SAMPLES
		: LIVE_FIRST_DECODE_SAMPLES;
	if (
		liveTranscribePromise ||
		!liveSpeechActive ||
		liveAudioSampleCount < minSamples
	) {
		return;
	}
	const silenceMs = Date.now() - liveLastVoiceAt;
	const isSilenceTrigger = trigger === "silence";
	if (!isSilenceTrigger) {
		if (Date.now() - liveLastDecodeAt < LIVE_MIN_DECODE_INTERVAL_MS) {
			return;
		}
		if (
			liveAudioSampleCount - liveLastDecodeSampleCount <
			LIVE_DECODE_INTERVAL_SAMPLES
		) {
			return;
		}
	} else if (silenceMs < LIVE_SILENCE_FLUSH_MS) {
		return;
	}

	const audio = concatenateAudioChunks(liveAudioChunks, liveAudioSampleCount);
	liveTranscribePromise = (async () => {
		const normalizedAudio = normalizeAudioForStt(audio);
		liveLastDecodeSampleCount = liveAudioSampleCount;
		liveLastDecodeAt = Date.now();
		console.log(
			`[Parakeet] decode attempt trigger=${trigger} samples=${normalizedAudio.length}`,
		);
		if (!liveParakeetStarted) {
			liveParakeetStarted = true;
			console.log(
				`[Parakeet] streaming decode started samples=${normalizedAudio.length}`,
			);
		}
		const sttResult = await transcribeAudioBufferDetailed(normalizedAudio);
		const text = normalizeWhitespace(sttResult.text);
		if (text) {
			pendingTranscript = text;
		}

		if (text && sttResult.endOfUtterance) {
			const stabilizedAgainstPrevious =
				liveEouCandidateCount > 0 &&
				areEouCandidatesCompatible(liveEouCandidateTranscript, text);
			if (stabilizedAgainstPrevious) {
				liveEouCandidateCount += 1;
				liveEouCandidateTranscript = pickPreferredEouTranscript(
					liveEouCandidateTranscript,
					text,
				);
			} else {
				liveEouCandidateTranscript = text;
				liveEouCandidateCount = 1;
				liveFirstEouAt = Date.now();
			}

			if (!liveFirstEouAt) {
				liveFirstEouAt = Date.now();
			}

			console.log(
				`[Parakeet] EOU candidate count=${liveEouCandidateCount} text="${text.slice(0, 120)}"`,
			);

			const silenceAfterEouMs = Date.now() - liveLastVoiceAt;
			const eouStableMs = Date.now() - liveFirstEouAt;
			const eouWordCount = collapseRepeatedWords(
				tokenizeTranscript(liveEouCandidateTranscript),
			).length;
			if (
				(trigger === "silence" && liveEouCandidateCount >= 1) ||
				(liveEouCandidateCount >= 2 &&
					silenceAfterEouMs >= LIVE_EOU_SILENCE_CONFIRM_MS &&
					eouStableMs >= LIVE_EOU_STABILITY_MS) ||
				(liveEouCandidateCount >= 3 &&
					eouStableMs >= LIVE_PERSISTENT_EOU_FLUSH_MS &&
					eouWordCount >= LIVE_PERSISTENT_EOU_MIN_WORDS)
			) {
				pendingTranscript = liveEouCandidateTranscript;
				await flushLiveTranscript("parakeet-eou");
				return;
			}
		} else if (text) {
			liveEouCandidateTranscript = "";
			liveEouCandidateCount = 0;
			liveFirstEouAt = 0;
		}
	})()
		.catch((error) => {
			console.error("[VoicePipeline] live transcribe error:", error);
			resetLiveAudioBuffer();
			setState("recording");
		})
		.finally(() => {
			liveTranscribePromise = null;
		});
}

function scheduleLiveFinalizeCheck() {
	if (liveFinalizeTimer) {
		clearTimeout(liveFinalizeTimer);
	}

	liveFinalizeTimer = setTimeout(() => {
		liveFinalizeTimer = null;
		maybeDecodeLiveUtterance("silence");
	}, LIVE_SILENCE_FLUSH_MS + 60);
}

function summarizeVadFrames(frames: SileroVadFrameResult[]) {
	let maxProbability = 0;
	let isSpeech = false;
	let speechStarted = false;
	let speechEnded = false;

	for (const frame of frames) {
		maxProbability = Math.max(maxProbability, frame.speechProbability);
		if (frame.isSpeech) {
			isSpeech = true;
		}
		if (frame.speechStarted) {
			speechStarted = true;
		}
		if (frame.speechEnded) {
			speechEnded = true;
		}
	}

	return {
		maxProbability,
		isSpeech,
		speechStarted,
		speechEnded,
	};
}

async function handleNativeChunk(event: {
	pcm16Base64: string;
	frameCount: number;
}): Promise<void> {
	if (!passiveListeningEnabled) {
		return;
	}
	if (currentState === "speaking" || currentState === "processing") {
		return;
	}

	const chunk = decodeBase64Pcm16ToFloat32(event.pcm16Base64);
	pushLivePreRollChunk(chunk);

	const vadFrames = liveVadStream ? await liveVadStream.pushAudio(chunk) : [];
	const vadSummary = summarizeVadFrames(vadFrames);

	if (vadSummary.isSpeech) {
		liveLastVoiceAt = Date.now();
	}

	if (vadSummary.speechStarted && !liveSpeechActive) {
		const preRollChunks = [...livePreRollChunks];
		console.log(
			`[SileroVAD] speech detected prob=${vadSummary.maxProbability.toFixed(3)}`,
		);
		resetLiveAudioBuffer();
		livePreRollChunks = preRollChunks;
		livePreRollSampleCount = preRollChunks.reduce(
			(sum, preRollChunk) => sum + preRollChunk.length,
			0,
		);
		bootstrapLiveAudioBufferFromPreRoll();
		liveSpeechActive = true;
	}

	if (liveSpeechActive) {
		liveAudioChunks.push(chunk);
		liveAudioSampleCount += chunk.length;
		trimLiveAudioIfNeeded();
		scheduleLiveFinalizeCheck();
	}

	setState("recording");

	if (liveSpeechActive) {
		maybeDecodeLiveUtterance("periodic");
	}
}

async function startNativePassiveListening(): Promise<void> {
	nativeChunkSubscription?.remove();
	nativeStateSubscription?.remove();
	resetLiveAudioBuffer();
	clearPendingUtterance();
	liveVadStream?.dispose();
	liveVadStream = null;
	liveChunkQueue = Promise.resolve();

	const vadReady = isSileroVadReady() || (await initSileroVadRuntime());
	if (vadReady) {
		liveVadStream = createSileroVadStream();
	} else {
		console.warn("[SileroVAD] unavailable, native speech gating disabled");
	}

	nativeStateSubscription = addNativeAudioStateListener((event) => {
		if (event.state === "error" || event.state === "convert_error") {
			console.log("[NativeAudioCapture]", event);
		}
	});

	nativeChunkSubscription = addNativeAudioChunkListener((event) => {
		liveChunkQueue = liveChunkQueue
			.then(async () => {
				await handleNativeChunk(event);
			})
			.catch((error) => {
				console.error("[VoicePipeline] native chunk handler error:", error);
			});
	});

	await ensureNativeCaptureStarted();
}

async function runPassiveListeningLoop(): Promise<void> {
	while (passiveListeningEnabled) {
		if (currentState === "speaking" || currentState === "processing") {
			await sleep(PASSIVE_LOOP_POLL_MS);
			continue;
		}

		try {
			const result = await recordSlice();
			if (!passiveListeningEnabled) {
				break;
			}

			const likelySilent =
				typeof result.metering === "number" &&
				result.metering < MIN_SILENCE_METERING;

			if (likelySilent && !pendingTranscript) {
				console.log(
					`[VoicePipeline] slice=${result.sliceId} skipped as likely silence`,
				);
				setState("idle");
				continue;
			}

			setState("processing");
			const sttResult = await transcribeDetailed(result.uri);
			const text = normalizeWhitespace(sttResult.text);
			console.log(
				`[VoicePipeline] slice=${result.sliceId} text="${text.slice(0, 120)}" eou=${String(
					sttResult.endOfUtterance,
				)} fallback=${String(sttResult.usedFallback)}`,
			);

			if (text) {
				pendingTranscript = mergeTranscript(pendingTranscript, text);
				emptySliceCount = 0;
				console.log(
					`[VoicePipeline] pending="${pendingTranscript.slice(0, 160)}" emptySlices=${emptySliceCount}`,
				);
			} else {
				emptySliceCount += 1;
				console.log(
					`[VoicePipeline] slice=${result.sliceId} empty transcript emptySlices=${emptySliceCount}`,
				);
			}

			const shouldFlush =
				Boolean(pendingTranscript) &&
				(sttResult.endOfUtterance ||
					hasTerminalPunctuation(pendingTranscript) ||
					emptySliceCount >= EMPTY_SLICES_BEFORE_FLUSH);

			if (shouldFlush) {
				console.log(
					`[VoicePipeline] flushing pending transcript="${pendingTranscript.slice(0, 160)}"`,
				);
				await maybeProcessPendingTurn();
			} else {
				setState("idle");
			}
		} catch (error) {
			if (!passiveListeningEnabled) {
				break;
			}
			handlePipelineError("[VoicePipeline] passive loop error:", error);
			await sleep(300);
		}
	}

	if (currentState !== "speaking" && currentState !== "processing") {
		setState("idle");
	}
}

export async function startListening(): Promise<void> {
	passiveListeningEnabled = true;

	if (Platform.OS === "ios") {
		const nativeAvailable = isNativeAudioCaptureAvailable();

		if (!nativeAvailable) {
			throw new Error(
				"Native iOS audio capture module is unavailable in this build. Rebuild the app with `npx expo run:ios`.",
			);
		}

		await startNativePassiveListening();
		return;
	}

	if (passiveLoopPromise) {
		return;
	}

	passiveLoopPromise = runPassiveListeningLoop().finally(() => {
		passiveLoopPromise = null;
	});
}

export async function stopListening(): Promise<void> {
	passiveListeningEnabled = false;
	turnGeneration += 1;
	clearPendingUtterance();
	nativeChunkSubscription?.remove();
	nativeChunkSubscription = null;
	nativeStateSubscription?.remove();
	nativeStateSubscription = null;
	liveVadStream?.dispose();
	liveVadStream = null;
	liveChunkQueue = Promise.resolve();
	resetLiveAudioBuffer();
	stopSpeaking();

	if (Platform.OS === "ios" && isNativeAudioCaptureAvailable()) {
		try {
			await ensureNativeCaptureStopped();
		} catch {}
	}

	try {
		await cancelRecording();
	} catch {}

	setState("idle");
}

export function cancelTurn(): void {
	turnGeneration += 1;
	clearPendingUtterance();
	resetLiveAudioBuffer();
	liveVadStream?.reset();
	stopSpeaking();
	void cancelRecording().catch(() => {});
	void ensureNativeCaptureStopped().catch(() => {});
	setState("idle");

	if (passiveListeningEnabled && !passiveLoopPromise) {
		void startListening();
	}
}

export async function runCheckIn(): Promise<void> {
	if (currentState !== "idle") {
		return;
	}

	const { userName } = useAppStore.getState();
	const conversationStore = useConversationStore.getState();
	const memories = await getTopMemories(10);
	await ensureSurveyStoreHydrated();
	await flushPendingWellbeingEvaluation(getLocalDateKey());
	const surveyState = useSurveyStore.getState();
	const recentSurveyContext = formatRecentSurveyContext(
		buildAggregatedSurveyHistory(
			surveyState.surveyHistory,
			surveyState.aiSurveyHistory,
		),
	);
	const systemPrompt = buildSystemPrompt(
		userName ?? "friend",
		memories,
		recentSurveyContext,
	);
	const checkInMessages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		{
			role: "user",
			content:
				"It's morning check-in time. Start by greeting me, telling me today's date, checking my calendar, and asking how I'm feeling. Keep it warm and brief.",
		},
	];

	conversationStore.clearSession();
	conversationStore.addMessage({ role: "assistant", text: "" });
	setState("processing");

	try {
		await streamAssistantReply(checkInMessages);
	} catch (error) {
		handlePipelineError("[VoicePipeline] Check-in error:", error);
	}
}

export async function runVoiceWelcome(): Promise<void> {
	if (currentState !== "idle") {
		return;
	}

	const conversationStore = useConversationStore.getState();
	if (conversationStore.messages.length > 0) {
		return;
	}
	if (Date.now() - lastVoiceWelcomeStartedAt < VOICE_WELCOME_DEBOUNCE_MS) {
		return;
	}
	lastVoiceWelcomeStartedAt = Date.now();

	const { userName } = useAppStore.getState();
	const memories = await getTopMemories(10);
	await ensureSurveyStoreHydrated();
	const todayKey = getLocalDateKey();
	await flushPendingWellbeingEvaluation(todayKey);
	const wellbeingContext = getStoredWellbeingContext(todayKey, null);
	const recentSurveyContext = formatRecentSurveyContext(
		wellbeingContext.aggregatedHistory,
	);
	const systemPrompt = buildSystemPrompt(
		userName ?? "friend",
		memories,
		recentSurveyContext,
	);
	if (wellbeingContext.shouldAcknowledgeCompletion) {
		useSurveyStore.getState().setAiAssessmentStatus(todayKey, {
			complete: true,
			acknowledged: true,
		});
	}
	const voiceWelcomeMessages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		{
			role: "system",
			content: [
				`Current self-reported scores today: ${formatScoreSnapshot(
					wellbeingContext.todaySelfScores,
				)}.`,
				`Current AI-evaluated scores today: ${formatScoreSnapshot(
					wellbeingContext.todayAiScores,
				)}.`,
				`Current aggregated wellbeing scores today: ${formatScoreSnapshot(
					wellbeingContext.todayAggregatedScores,
				)}.`,
				wellbeingContext.priorityDomain
					? `Open by gently probing ${formatScoreBucketLabel(
							wellbeingContext.priorityDomain,
						)} first with an open-ended question that goes deeper than the survey form.`
					: "Open with the single question most likely to reveal mood, worry, sleep, physical recovery, or support in a natural way.",
				wellbeingContext.shouldAcknowledgeCompletion
					? "Briefly let the user know you already have what you need for today's wellbeing picture, then continue warmly and naturally."
					: "Do not mention hidden internal scoring.",
			].join(" "),
		},
		{
			role: "user",
			content:
				"The user just opened the voice agent. Start with one warm, proactive message that gently guides the conversation toward today's wellbeing picture. Do not repeat the exact survey wording. Ask one open-ended question that invites a deeper answer and helps complete today's hidden wellbeing scoring. Keep it natural, spoken, and under 3 sentences.",
		},
	];

	conversationStore.clearSession();
	conversationStore.addMessage({ role: "assistant", text: "" });
	setState("processing");

	try {
		await streamAssistantReply(voiceWelcomeMessages);
	} catch (error) {
		handlePipelineError("[VoicePipeline] Voice welcome error:", error);
	}
}

export { getState };
