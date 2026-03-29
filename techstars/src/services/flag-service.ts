import {
	getSortedSurveyDates,
	type SurveyHistory,
	type SurveyScores,
} from "@/state/survey-state";

export type FlagType =
	| "ppd_risk"
	| "mood_decline"
	| "sleep_decline"
	| "language_alert"
	| "voice_discrepancy";

export type FlagSeverity = "low" | "medium" | "high" | "urgent";

export interface DetectedFlag {
	type: FlagType;
	severity: FlagSeverity;
	reason: string;
	differential: string | null;
	suggestedAction: string | null;
}

const HOPELESSNESS_THRESHOLD = 4;
const MOOD_LOW_THRESHOLD = 40;
const CONSECUTIVE_MOOD_DAYS = 3;
const DECLINING_STREAK_DAYS = 5;

function getRecentScores(
	history: SurveyHistory,
	days: number,
): { date: string; scores: SurveyScores }[] {
	const dates = getSortedSurveyDates(history).slice(-days);
	return dates.map((date) => ({ date, scores: history[date] ?? {} }));
}

function isDecliningSeries(values: (number | undefined)[]): boolean {
	const nums = values.filter((v): v is number => typeof v === "number");
	if (nums.length < 3) return false;
	let declining = 0;
	for (let i = 1; i < nums.length; i++) {
		if (nums[i] < nums[i - 1]) declining++;
	}
	return declining >= nums.length - 1;
}

/**
 * Detects PPD-risk and mood/sleep decline flags based on survey history.
 *
 * Rules (from project.md, EPDS-grounded proxy):
 * 1. Hopelessness >= 4/5 today -> immediate PPD flag (urgent)
 * 2. moodDepression <= 40/100 for 3+ consecutive days -> PPD risk (high)
 * 3. Mood + energy declining 5+ days -> escalate (high)
 * 4. Sleep declining + mood declining together -> highest priority (urgent)
 */
export function detectFlags(
	history: SurveyHistory,
	rawHopelessness: number | null,
): DetectedFlag[] {
	const flags: DetectedFlag[] = [];

	if (rawHopelessness !== null && rawHopelessness >= HOPELESSNESS_THRESHOLD) {
		flags.push({
			type: "ppd_risk",
			severity: "urgent",
			reason: `Hopelessness self-report at ${rawHopelessness}/5 — exceeds EPDS proxy threshold.`,
			differential:
				"Possible postpartum depression, acute emotional crisis, or severe sleep deprivation presenting as hopelessness.",
			suggestedAction:
				"Schedule same-day phone check-in. Consider formal EPDS screening and mental health referral.",
		});
	}

	const recent7 = getRecentScores(history, 7);

	const consecutiveLowMood = countConsecutiveLowFromEnd(
		recent7.map((r) => r.scores.moodDepression),
		MOOD_LOW_THRESHOLD,
	);
	if (consecutiveLowMood >= CONSECUTIVE_MOOD_DAYS) {
		flags.push({
			type: "ppd_risk",
			severity: "high",
			reason: `Mood score at or below ${MOOD_LOW_THRESHOLD}/100 for ${consecutiveLowMood} consecutive days.`,
			differential:
				"Possible PPD, adjustment disorder, or chronic sleep deprivation masking as depression.",
			suggestedAction:
				"Schedule 15-min phone check-in within 48 hours. Consider EPDS screening.",
		});
	}

	const moodValues = recent7.map((r) => r.scores.moodDepression);
	const sleepValues = recent7.map((r) => r.scores.sleepFatigue);

	const moodDeclining = isDecliningSeries(moodValues);
	const sleepDeclining = isDecliningSeries(sleepValues);

	if (moodDeclining && sleepDeclining) {
		flags.push({
			type: "mood_decline",
			severity: "urgent",
			reason:
				"Both mood and sleep scores declining concurrently over recent check-ins.",
			differential:
				"Co-declining sleep and mood pattern — high risk for PPD onset. Could also indicate acute stressor, medical complication, or infant health concern.",
			suggestedAction:
				"Priority outreach within 24 hours. Assess for PPD, review sleep environment, screen for medical complications.",
		});
	} else if (moodDeclining && recent7.length >= DECLINING_STREAK_DAYS) {
		flags.push({
			type: "mood_decline",
			severity: "high",
			reason: `Mood and energy scores declining over ${recent7.length} recent check-ins.`,
			differential:
				"Possible emerging PPD, postpartum anxiety, or burnout from return-to-work transition.",
			suggestedAction:
				"Schedule phone check-in. Review workload and support systems.",
		});
	} else if (sleepDeclining && recent7.length >= DECLINING_STREAK_DAYS) {
		flags.push({
			type: "sleep_decline",
			severity: "medium",
			reason: `Sleep scores declining over ${recent7.length} recent check-ins.`,
			differential:
				"Worsening infant sleep patterns, anxiety-driven insomnia, or pain interfering with sleep.",
			suggestedAction:
				"Review sleep hygiene. Consider whether pain management or anxiety support is needed.",
		});
	}

	return flags;
}

function countConsecutiveLowFromEnd(
	values: (number | undefined)[],
	threshold: number,
): number {
	let count = 0;
	for (let i = values.length - 1; i >= 0; i--) {
		const v = values[i];
		if (typeof v !== "number") break;
		if (v <= threshold) count++;
		else break;
	}
	return count;
}
