import type { ChatMessage } from "@/services/llm/groq-client";
import { chatOnce } from "@/services/llm/groq-client";
import type { RecoveryScoreResult } from "@/services/recovery-score-service";
import { saveDailySummary } from "@/services/supabase/daily-summary-service";
import {
	formatRecentSurveyContext,
	getSurveyDateKey,
	type SurveyHistory,
	type SurveyScores,
} from "@/state/survey-state";

const SYSTEM_PROMPT = `You are a warm, encouraging companion helping a postpartum woman track her recovery. Write a short daily reflection (2-3 sentences max). Acknowledge her effort. If scores improved from recent days, celebrate it briefly. If scores dipped, normalize it ("recovery isn't linear"). End with one tiny, specific actionable tip related to her lowest-scoring domain. Never use clinical language. Never mention scores as numbers. Sound like a caring friend, not a chatbot.`;

function buildUserPrompt(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	userName: string | null;
}): string {
	const historyContext =
		formatRecentSurveyContext(opts.surveyHistory) ?? "No previous check-ins.";
	const name = opts.userName?.trim()?.split(" ")[0] || "her";
	const overall = opts.recoveryResult?.overall ?? "unknown";
	const tag = opts.hardestTag ?? "not specified";

	const domainLines: string[] = [];
	if (opts.recoveryResult) {
		const r = opts.recoveryResult;
		domainLines.push(
			`Physical: ${r.physical}/100, Mental: ${r.mental}/100, Sleep: ${r.sleep}/100, Support: ${r.support}/100`,
		);
	}

	return [
		`Here is today's check-in.`,
		`Recovery score: ${overall}/100.`,
		domainLines.length > 0 ? `Domain breakdown: ${domainLines.join(". ")}` : "",
		`Biggest challenge today: ${tag}.`,
		`Recent history:\n${historyContext}`,
		`Her name is ${name}.`,
	]
		.filter(Boolean)
		.join(" ");
}

/**
 * Generates a warm daily reflection via Groq and returns the text.
 * Returns null if the LLM call fails (graceful offline).
 */
export async function generateDailySummary(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	userName: string | null;
}): Promise<string | null> {
	try {
		const messages: ChatMessage[] = [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: buildUserPrompt(opts) },
		];
		const text = await chatOnce(messages);
		return text.trim() || null;
	} catch (err) {
		console.warn("[DailySummary] generation failed:", err);
		return null;
	}
}

/**
 * Fire-and-forget orchestrator: generates the summary, writes to Zustand + Supabase.
 * Called from handleSave in daily-survey.tsx — never throws.
 */
export async function generateAndStoreSummary(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	userName: string | null;
	supabaseUserId: string | null;
	upsertSummary: (dateKey: string, text: string) => void;
}): Promise<void> {
	try {
		const text = await generateDailySummary(opts);
		if (!text) return;

		const todayKey = getSurveyDateKey();
		opts.upsertSummary(todayKey, text);

		if (opts.supabaseUserId) {
			saveDailySummary(opts.supabaseUserId, text);
		}
	} catch (err) {
		console.warn("[DailySummary] generateAndStoreSummary failed:", err);
	}
}
