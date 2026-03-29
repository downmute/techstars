import { chatStructuredOnce, type ChatMessage } from "@/services/llm/groq-client";
import type { Message } from "@/state/conversation-state";
import {
	formatRecentSurveyContext,
	surveyCategories,
	type SurveyCategory,
	type SurveyHistory,
	type SurveyScores,
} from "@/state/survey-state";

export interface VoiceWellbeingEvaluation {
	scores: SurveyScores;
	coveredDomains: SurveyCategory[];
	completedDomains: SurveyCategory[];
	allScoresReady: boolean;
	suggestedFocus: SurveyCategory | null;
}

interface TranscriptOptions {
	maxUserMessages: number;
	maxChars: number;
}

function clampScore(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return null;
	}
	return Math.max(0, Math.min(100, Math.round(value)));
}

function conversationToTranscript(
	messages: Message[],
	options: TranscriptOptions = { maxUserMessages: 6, maxChars: 1800 },
): string {
	const transcript = messages
		.filter((message) => message.role === "user")
		.slice(-options.maxUserMessages)
		.map((message) => `USER: ${message.text}`)
		.join("\n");

	return transcript.slice(-options.maxChars);
}

function formatScores(scores: SurveyScores | null | undefined): string {
	if (!scores) {
		return "none";
	}

	const parts = surveyCategories.flatMap((category) => {
		const value = scores[category];
		if (typeof value !== "number" || !Number.isFinite(value)) {
			return [];
		}
		return `${category}=${Math.round(value)}`;
	});

	return parts.length > 0 ? parts.join(", ") : "none";
}

function formatTrendContext(history: SurveyHistory | null | undefined): string {
	if (!history) {
		return "none";
	}

	return formatRecentSurveyContext(history, 5) ?? "none";
}

const SYSTEM_PROMPT = `You are Vela's hidden postpartum wellbeing scorer.

Return strict JSON only.

Score each domain from 0-100 where:
- 100 = doing very well today
- 0 = severe difficulty or concern today

Domains:
- moodDepression
- anxiety
- sleepFatigue
- physicalRecovery
- socialSupport

Use null if a score is still unclear.
Set completion true only when there is enough evidence to stand behind today's score.
Role-transition or work themes should inform moodDepression, anxiety, and socialSupport instead of becoming a new domain.
Use the existing aggregate scores as an anchor. Do not make large score swings from the prior aggregate unless the new transcript contains strong direct evidence of a real change today.
Small conversational hints should usually move a score only modestly.
Ignore obvious STT artifacts like repeated words or malformed fragments when scoring.
Use "none" for suggestedFocus only when all five domains are complete.`;

const NULLABLE_SCORE_SCHEMA = {
	anyOf: [{ type: "integer" }, { type: "null" }],
} as const;

const VOICE_WELLBEING_SCHEMA: Record<string, unknown> = {
	type: "object",
	properties: {
		scores: {
			type: "object",
			properties: {
				moodDepression: NULLABLE_SCORE_SCHEMA,
				anxiety: NULLABLE_SCORE_SCHEMA,
				sleepFatigue: NULLABLE_SCORE_SCHEMA,
				physicalRecovery: NULLABLE_SCORE_SCHEMA,
				socialSupport: NULLABLE_SCORE_SCHEMA,
			},
			required: surveyCategories,
			additionalProperties: false,
		},
		coverage: {
			type: "object",
			properties: {
				moodDepression: { type: "boolean" },
				anxiety: { type: "boolean" },
				sleepFatigue: { type: "boolean" },
				physicalRecovery: { type: "boolean" },
				socialSupport: { type: "boolean" },
			},
			required: surveyCategories,
			additionalProperties: false,
		},
		completion: {
			type: "object",
			properties: {
				moodDepression: { type: "boolean" },
				anxiety: { type: "boolean" },
				sleepFatigue: { type: "boolean" },
				physicalRecovery: { type: "boolean" },
				socialSupport: { type: "boolean" },
			},
			required: surveyCategories,
			additionalProperties: false,
		},
		allScoresReady: { type: "boolean" },
		suggestedFocus: {
			type: "string",
			enum: [...surveyCategories, "none"],
		},
	},
	required: [
		"scores",
		"coverage",
		"completion",
		"allScoresReady",
		"suggestedFocus",
	],
	additionalProperties: false,
};

function normalizeDomainFlags(
	value: unknown,
): Partial<Record<SurveyCategory, boolean>> {
	if (!value || typeof value !== "object") {
		return {};
	}

	const flags = value as Record<string, unknown>;
	const normalized: Partial<Record<SurveyCategory, boolean>> = {};
	for (const category of surveyCategories) {
		normalized[category] = Boolean(flags[category]);
	}
	return normalized;
}

export async function evaluateVoiceWellbeing(args: {
	messages: Message[];
	selfReportedScores?: SurveyScores | null;
	currentAggregatedScores?: SurveyScores | null;
	recentAggregatedHistory?: SurveyHistory | null;
}): Promise<VoiceWellbeingEvaluation | null> {
	const transcript = conversationToTranscript(args.messages);
	if (!transcript.trim()) {
		return null;
	}

	const buildMessages = (transcriptText: string): ChatMessage[] => [
		{ role: "system", content: SYSTEM_PROMPT },
		{
			role: "user",
			content: [
				`Self scores today: ${formatScores(args.selfReportedScores)}.`,
				`Current aggregate anchor today: ${formatScores(args.currentAggregatedScores)}.`,
				`Recent aggregate trend: ${formatTrendContext(args.recentAggregatedHistory)}.`,
				"Recent user transcript:",
				transcriptText,
			].join("\n"),
		},
	];

	const attempt = async (
		transcriptText: string,
		maxCompletionTokens: number,
		strict: boolean,
	): Promise<VoiceWellbeingEvaluation> => {
		const parsed = (await chatStructuredOnce<Record<string, unknown>>({
			model: "openai/gpt-oss-20b",
			messages: buildMessages(transcriptText),
			schemaName: "voice_wellbeing_scores",
			schema: VOICE_WELLBEING_SCHEMA,
			strict,
			maxCompletionTokens,
			temperature: 0,
		})) as Record<string, unknown>;

		const rawScores =
			parsed.scores && typeof parsed.scores === "object"
				? (parsed.scores as Record<string, unknown>)
				: {};
		const scores: SurveyScores = {};
		for (const category of surveyCategories) {
			const value = clampScore(rawScores[category]);
			if (value !== null) {
				scores[category] = value;
			}
		}

		const coverageFlags = normalizeDomainFlags(parsed.coverage);
		const completionFlags = normalizeDomainFlags(parsed.completion);
		const coveredDomains = surveyCategories.filter(
			(category) => coverageFlags[category],
		);
		const completedDomains = surveyCategories.filter(
			(category) => completionFlags[category],
		);
		const suggestedFocus =
			parsed.suggestedFocus === "none"
				? null
				: surveyCategories.includes(parsed.suggestedFocus as SurveyCategory)
					? (parsed.suggestedFocus as SurveyCategory)
					: null;

		return {
			scores,
			coveredDomains,
			completedDomains,
			allScoresReady: Boolean(parsed.allScoresReady),
			suggestedFocus,
		};
	};

	try {
		return await attempt(transcript, 260, true);
	} catch {
		try {
			return await attempt(transcript, 320, false);
		} catch {
			const fallbackTranscript = conversationToTranscript(args.messages, {
				maxUserMessages: 3,
				maxChars: 900,
			});
			try {
				if (!fallbackTranscript.trim()) {
					return null;
				}
				return await attempt(fallbackTranscript, 360, false);
			} catch (fallbackError) {
				console.warn("[VoiceEval] scoring failed:", fallbackError);
				return null;
			}
		}
	}
}
