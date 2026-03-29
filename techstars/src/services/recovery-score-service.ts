import {
	type SurveyCategory,
	type SurveyScores,
	surveyCategories,
} from "@/state/survey-state";

export interface RecoveryScoreResult {
	overall: number;
	physical: number;
	mental: number;
	sleep: number;
	support: number;
}

type WeightProfile = Record<SurveyCategory, number>;

/**
 * STORK-inspired dynamic weights derived from:
 * - STORK item distribution (Physical 25%, Mental 34%, Support 25%, Sleep 15%)
 * - Multicenter assessment trajectory data (JAMA Network Open, 2025):
 *     Mental + Support plateau at week 6; Physical + Sleep improve through week 12.
 *
 * Weeks 0-6: upweight mental (PPD risk window, highest volatility).
 * Weeks 6-12+: shift toward physical/sleep (still improving, main differentiators).
 */
const WEIGHTS_0_6: WeightProfile = {
	moodDepression: 0.25,
	anxiety: 0.15,
	sleepFatigue: 0.25,
	physicalRecovery: 0.2,
	socialSupport: 0.15,
};

const WEIGHTS_6_12: WeightProfile = {
	moodDepression: 0.15,
	anxiety: 0.1,
	sleepFatigue: 0.25,
	physicalRecovery: 0.35,
	socialSupport: 0.15,
};

export function getWeights(weeksPostpartum: number | null): WeightProfile {
	if (weeksPostpartum === null || weeksPostpartum < 6) return WEIGHTS_0_6;
	return WEIGHTS_6_12;
}

export function computeRecoveryScore(
	scores: SurveyScores,
	weeksPostpartum: number | null,
): RecoveryScoreResult | null {
	const weights = getWeights(weeksPostpartum);

	let weightedSum = 0;
	let totalWeight = 0;

	for (const category of surveyCategories) {
		const value = scores[category];
		if (typeof value !== "number" || !Number.isFinite(value)) continue;
		weightedSum += value * weights[category];
		totalWeight += weights[category];
	}

	if (totalWeight === 0) return null;

	const overall = Math.round(weightedSum / totalWeight);

	const mentalValues = [scores.moodDepression, scores.anxiety].filter(
		(v): v is number => typeof v === "number" && Number.isFinite(v),
	);
	const mental =
		mentalValues.length > 0
			? Math.round(
					mentalValues.reduce((s, v) => s + v, 0) / mentalValues.length,
				)
			: overall;

	return {
		overall,
		physical: scores.physicalRecovery ?? overall,
		mental,
		sleep: scores.sleepFatigue ?? overall,
		support: scores.socialSupport ?? overall,
	};
}
