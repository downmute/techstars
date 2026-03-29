import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const surveyCategories = [
  'moodDepression',
  'anxiety',
  'sleepFatigue',
  'physicalRecovery',
  'socialSupport',
  'roleTransition',
] as const;

export type SurveyCategory = (typeof surveyCategories)[number];

export type SurveyScores = Partial<Record<SurveyCategory, number>>;

export type SurveyHistory = Record<string, SurveyScores>;

interface SurveyStore {
  surveyHistory: SurveyHistory;
  upsertSurveyScores: (date: string, scores: SurveyScores) => void;
  clearSurveyHistory: () => void;
}

type PersistApi = {
  hasHydrated: () => boolean;
  rehydrate: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

export function getSurveyDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSortedSurveyDates(history: SurveyHistory): string[] {
  return Object.keys(history).sort((a, b) => a.localeCompare(b));
}

export function computeOverallWellbeing(scores: SurveyScores): number | null {
  const values = Object.values(scores).filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (values.length === 0) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatScoreLabel(category: SurveyCategory): string {
  switch (category) {
    case 'moodDepression':
      return 'mood';
    case 'anxiety':
      return 'anxiety';
    case 'sleepFatigue':
      return 'sleep';
    case 'physicalRecovery':
      return 'recovery';
    case 'socialSupport':
      return 'support';
    case 'roleTransition':
      return 'role';
  }
}

export function formatRecentSurveyContext(
  history: SurveyHistory,
  limit = 7
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
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return [];
        }
        return `${formatScoreLabel(category)} ${Math.round(value)}`;
      })
      .join(', ');

    const overallText =
      typeof overall === 'number' ? `overall ${overall}` : 'overall unavailable';

    return `- ${date}: ${overallText}${scoreParts ? `; ${scoreParts}` : ''}`;
  });

  return lines.join('\n');
}

export async function ensureSurveyStoreHydrated(): Promise<void> {
  const persistApi = (useSurveyStore as typeof useSurveyStore & {
    persist?: PersistApi;
  }).persist;

  if (!persistApi || persistApi.hasHydrated()) {
    return;
  }

  hydrationPromise ??= persistApi
    .rehydrate()
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
      clearSurveyHistory: () => set({ surveyHistory: {} }),
    }),
    {
      name: '@vela/survey-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
