import type { DetectedFlag } from "@/services/flag-service";
import type { ChatMessage } from "@/services/llm/groq-client";
import { chatOnce } from "@/services/llm/groq-client";
import type { RecoveryScoreResult } from "@/services/recovery-score-service";
import { saveClinicalSummary } from "@/services/supabase/daily-summary-service";
import {
	formatRecentSurveyContext,
	type SurveyHistory,
	type SurveyScores,
} from "@/state/survey-state";

const SYSTEM_PROMPT = `You are a clinical decision support tool for an OB/GYN provider reviewing postpartum patients between visits. Write a concise clinical note (3-5 sentences). Report domain scores, trend direction, active flags, and risk indicators using clinical language. Be factual and direct. No encouragement, no softening, no patient-facing language. If flags are present, state the pattern and clinical implication. End with a one-line recommended action if warranted.`;

function buildClinicalPrompt(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	flags: DetectedFlag[];
	weeksPostpartum: number | null;
	rawHopelessness: number | null;
}): string {
	const historyContext =
		formatRecentSurveyContext(opts.surveyHistory) ?? "No prior check-ins.";
	const overall = opts.recoveryResult?.overall ?? "N/A";
	const weeksPP = opts.weeksPostpartum ?? "unknown";

	const domainLines: string[] = [];
	if (opts.recoveryResult) {
		const r = opts.recoveryResult;
		domainLines.push(
			`Physical ${r.physical}/100, Mental ${r.mental}/100, Sleep ${r.sleep}/100, Support ${r.support}/100`,
		);
	}

	const flagLines =
		opts.flags.length > 0
			? opts.flags
					.map(
						(f) =>
							`[${f.severity.toUpperCase()}] ${f.type}: ${f.reason}${f.differential ? ` Differential: ${f.differential}` : ""}`,
					)
					.join("\n")
			: "No active flags.";

	return [
		`Patient: ${weeksPP} weeks postpartum.`,
		`Today's recovery score: ${overall}/100.`,
		domainLines.length > 0 ? `Domains: ${domainLines.join(". ")}.` : "",
		opts.rawHopelessness !== null
			? `Hopelessness raw score: ${opts.rawHopelessness}/5.`
			: "",
		`Self-reported hardest challenge: ${opts.hardestTag ?? "not specified"}.`,
		`\nActive flags:\n${flagLines}`,
		`\n7-day history:\n${historyContext}`,
	]
		.filter(Boolean)
		.join("\n");
}

export async function generateClinicalSummary(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	flags: DetectedFlag[];
	weeksPostpartum: number | null;
	rawHopelessness: number | null;
}): Promise<string | null> {
	try {
		const messages: ChatMessage[] = [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: buildClinicalPrompt(opts) },
		];
		const text = await chatOnce(messages);
		return text.trim() || null;
	} catch (err) {
		console.warn("[ClinicalSummary] generation failed:", err);
		return null;
	}
}

/**
 * Fire-and-forget orchestrator: generates the clinical summary and writes to Supabase.
 * Called from handleSave in daily-survey.tsx alongside the user-facing summary — never throws.
 */
export async function generateAndStoreClinicalSummary(opts: {
	scores: SurveyScores;
	recoveryResult: RecoveryScoreResult | null;
	hardestTag: string | null;
	surveyHistory: SurveyHistory;
	flags: DetectedFlag[];
	weeksPostpartum: number | null;
	rawHopelessness: number | null;
	supabaseUserId: string | null;
}): Promise<void> {
	if (!opts.supabaseUserId) return;

	try {
		const text = await generateClinicalSummary(opts);
		if (!text) return;

		saveClinicalSummary(opts.supabaseUserId, text);
	} catch (err) {
		console.warn(
			"[ClinicalSummary] generateAndStoreClinicalSummary failed:",
			err,
		);
	}
}
