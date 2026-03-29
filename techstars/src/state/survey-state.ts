import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getLocalDateKey } from "@/lib/date-utils";

export const surveyCategories = [
	"moodDepression",
	"anxiety",
	"sleepFatigue",
	"physicalRecovery",
	"socialSupport",
] as const;

export type SurveyCategory = (typeof surveyCategories)[number];

export type SurveyScores = Partial<Record<SurveyCategory, number>>;

export type SurveyHistory = Record<string, SurveyScores>;

export type SummaryHistory = Record<string, string>;
export type AiAssessmentStatus = Record<
	string,
	{ complete: boolean; acknowledged: boolean }
>;

interface SurveyStore {
	surveyHistory: SurveyHistory;
	aiSurveyHistory: SurveyHistory;
	aiAssessmentStatus: AiAssessmentStatus;
	summaryHistory: SummaryHistory;
	upsertSurveyScores: (date: string, scores: SurveyScores) => void;
	upsertAiSurveyScores: (date: string, scores: SurveyScores) => void;
	setAiAssessmentStatus: (
		date: string,
		status: Partial<{ complete: boolean; acknowledged: boolean }>,
	) => void;
	upsertSummary: (date: string, text: string) => void;
	clearSurveyHistory: () => void;
}

type PersistApi = {
	hasHydrated: () => boolean;
	rehydrate: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

export function getSurveyDateKey(date: Date = new Date()): string {
	return getLocalDateKey(date);
}

export function getSortedSurveyDates(history: SurveyHistory): string[] {
	return Object.keys(history).sort((a, b) => a.localeCompare(b));
}

/** @deprecated Use `computeWeightedScore` for STORK-grounded weighted scoring. */
export function computeOverallWellbeing(scores: SurveyScores): number | null {
	const values = Object.values(scores).filter(
		(value): value is number =>
			typeof value === "number" && Number.isFinite(value),
	);

	if (values.length === 0) {
		return null;
	}

	return Math.round(
		values.reduce((sum, value) => sum + value, 0) / values.length,
	);
}

function formatScoreLabel(category: SurveyCategory): string {
	switch (category) {
		case "moodDepression":
			return "mood";
		case "anxiety":
			return "anxiety";
		case "sleepFatigue":
			return "sleep";
		case "physicalRecovery":
			return "recovery";
		case "socialSupport":
			return "support";
	}
}

export function formatRecentSurveyContext(
	history: SurveyHistory,
	limit = 7,
): string | null {
	const dates = getSortedSurveyDates(history).slice(-limit);
	if (dates.length === 0) {
		return null;
	}

	const lines = dates.map((date) => {
		const scores = history[date] ?? {};
		const overall = computeOverallWellbeing(scores);
		const scoreParts = surveyCategories
			.flatMap((category) => {
				const value = scores[category];
				if (typeof value !== "number" || !Number.isFinite(value)) {
					return [];
				}
				return `${formatScoreLabel(category)} ${Math.round(value)}`;
			})
			.join(", ");

		const overallText =
			typeof overall === "number"
				? `overall ${overall}`
				: "overall unavailable";

		return `- ${date}: ${overallText}${scoreParts ? `; ${scoreParts}` : ""}`;
	});

	return lines.join("\n");
}

export function aggregateSurveyScores(
	selfScores?: SurveyScores | null,
	aiScores?: SurveyScores | null,
	weights: { self: number; ai: number } = { self: 0.5, ai: 0.5 },
): SurveyScores {
	const aggregated: SurveyScores = {};

	for (const category of surveyCategories) {
		const selfValue = selfScores?.[category];
		const aiValue = aiScores?.[category];
		const hasSelf = typeof selfValue === "number" && Number.isFinite(selfValue);
		const hasAi = typeof aiValue === "number" && Number.isFinite(aiValue);

		if (hasSelf && hasAi) {
			const totalWeight = weights.self + weights.ai;
			aggregated[category] = Math.round(
				((selfValue * weights.self) + (aiValue * weights.ai)) / totalWeight,
			);
		} else if (hasSelf) {
			aggregated[category] = Math.round(selfValue);
		} else if (hasAi) {
			aggregated[category] = Math.round(aiValue);
		}
	}

	return aggregated;
}

export function buildAggregatedSurveyHistory(
	selfHistory: SurveyHistory,
	aiHistory: SurveyHistory,
	weights: { self: number; ai: number } = { self: 0.5, ai: 0.5 },
): SurveyHistory {
	const dates = new Set([
		...Object.keys(selfHistory),
		...Object.keys(aiHistory),
	]);
	const aggregated: SurveyHistory = {};

	for (const date of dates) {
		const scores = aggregateSurveyScores(
			selfHistory[date],
			aiHistory[date],
			weights,
		);
		if (Object.keys(scores).length > 0) {
			aggregated[date] = scores;
		}
	}

	return aggregated;
}

export async function ensureSurveyStoreHydrated(): Promise<void> {
	const persistApi = (
		useSurveyStore as typeof useSurveyStore & {
			persist?: PersistApi;
		}
	).persist;

	if (!persistApi || persistApi.hasHydrated()) {
		return;
	}

	hydrationPromise ??= Promise.resolve(persistApi.rehydrate())
		.catch(() => {})
		.finally(() => {
			hydrationPromise = null;
		});

	await hydrationPromise;
}

export const useSurveyStore = create<SurveyStore>()(
	persist(
		(set) => ({
			surveyHistory: {},
			aiSurveyHistory: {},
			aiAssessmentStatus: {},
			summaryHistory: {},
			upsertSurveyScores: (date, scores) =>
				set((state) => ({
					surveyHistory: {
						...state.surveyHistory,
						[date]: {
							...(state.surveyHistory[date] ?? {}),
							...scores,
						},
					},
				})),
			upsertAiSurveyScores: (date, scores) =>
				set((state) => ({
					aiSurveyHistory: {
						...state.aiSurveyHistory,
						[date]: {
							...(state.aiSurveyHistory[date] ?? {}),
							...scores,
						},
					},
				})),
			setAiAssessmentStatus: (date, status) =>
				set((state) => ({
					aiAssessmentStatus: {
						...state.aiAssessmentStatus,
						[date]: {
							complete: state.aiAssessmentStatus[date]?.complete ?? false,
							acknowledged:
								state.aiAssessmentStatus[date]?.acknowledged ?? false,
							...status,
						},
					},
				})),
			upsertSummary: (date, text) =>
				set((state) => ({
					summaryHistory: {
						...state.summaryHistory,
						[date]: text,
					},
				})),
			clearSurveyHistory: () =>
				set({
					surveyHistory: {},
					aiSurveyHistory: {},
					aiAssessmentStatus: {},
					summaryHistory: {},
				}),
		}),
		{
			name: "@vela/survey-history",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
