import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { Fonts } from '@/constants/theme';
import { DailySurvey } from '@/components/home/daily-survey';
import {
  WellbeingChart,
  type WellbeingPoint,
} from '@/components/home/wellbeing-chart';
import { useAppStore } from '@/state/app-state';
import {
  computeOverallWellbeing,
  getSortedSurveyDates,
  useSurveyStore,
} from '@/state/survey-state';

type TimeframeKey = '1w' | '1m' | '3m' | '6m';

const timeframeOptions: { key: TimeframeKey; label: string }[] = [
  { key: '1w', label: '1W' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
];

function getDayLabel(dateKey: string): string {
  const parsed = new Date(`${dateKey}T12:00:00`);
  return parsed.toLocaleDateString('en-US', { weekday: 'short' });
}

function getMonthLabel(monthIndex: number): string {
  return new Date(2026, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'short',
  });
}

function getDateAtLocalMidday(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function getTimeframeChartData(
  history: ReturnType<typeof useSurveyStore.getState>['surveyHistory'],
  timeframe: TimeframeKey
): WellbeingPoint[] {
  const dates = getSortedSurveyDates(history);

  if (timeframe === '1w') {
    return dates.slice(-7).flatMap((date) => {
      const overall = computeOverallWellbeing(history[date] ?? {});
      if (typeof overall !== 'number') {
        return [];
      }
      return [{ label: getDayLabel(date), value: overall }];
    });
  }

  if (timeframe === '1m') {
    const today = new Date();
    const weeklyBuckets = [0, 1, 2, 3].map((index) => ({
      label: `Wk ${index + 1}`,
      values: [] as number[],
    }));

    for (const date of dates) {
      const overall = computeOverallWellbeing(history[date] ?? {});
      if (typeof overall !== 'number') {
        continue;
      }

      const dayAge = Math.floor(
        (today.getTime() - getDateAtLocalMidday(date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (dayAge < 0 || dayAge >= 28) {
        continue;
      }

      const bucketIndex = 3 - Math.floor(dayAge / 7);
      if (bucketIndex >= 0 && bucketIndex < weeklyBuckets.length) {
        weeklyBuckets[bucketIndex]!.values.push(overall);
      }
    }

    return weeklyBuckets.flatMap((bucket) => {
      if (bucket.values.length === 0) {
        return [];
      }

      return [
        {
          label: bucket.label,
          value: Math.round(
            bucket.values.reduce((sum, value) => sum + value, 0) /
              bucket.values.length
          ),
        },
      ];
    });
  }

  const monthCount = timeframe === '3m' ? 3 : 6;
  const monthlyBuckets = new Map<string, number[]>();

  for (const date of dates) {
    const monthKey = date.slice(0, 7);
    const overall = computeOverallWellbeing(history[date] ?? {});
    if (typeof overall !== 'number') {
      continue;
    }

    const bucket = monthlyBuckets.get(monthKey) ?? [];
    bucket.push(overall);
    monthlyBuckets.set(monthKey, bucket);
  }

  return Array.from(monthlyBuckets.entries())
    .slice(-monthCount)
    .map(([monthKey, values]) => {
      const monthIndex = Number(monthKey.slice(5, 7)) - 1;
      const average = Math.round(
        values.reduce((sum, value) => sum + value, 0) / values.length
      );

      return {
        label: getMonthLabel(monthIndex),
        value: average,
      };
    });
}

export default function HomeScreen() {
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeKey>('1w');
  const userName = useAppStore((s) => s.userName);
  const surveyHistory = useSurveyStore((s) => s.surveyHistory);
  const chartData = getTimeframeChartData(surveyHistory, selectedTimeframe);
  const hasChartData = chartData.length > 0;
  const currentScore = chartData[chartData.length - 1]?.value ?? null;
  const averageScore = hasChartData
    ? Math.round(
        chartData.reduce((total, point) => total + point.value, 0) /
          chartData.length
      )
    : null;
  const change =
    hasChartData && currentScore !== null
      ? currentScore - chartData[0]!.value
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)}>
            <Text style={styles.eyebrow}>Daily home</Text>
            <Text style={styles.title}>Hi {userName?.trim() || 'there'}!</Text>
            <Text style={styles.subtitle}>
              A single place to track mood, recovery, sleep, support, and
              return-to-work readiness.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(80).duration(450)}
            style={styles.voiceCard}
          >
            <View style={styles.voiceCardCopy}>
              <Text style={styles.cardEyebrow}>Voice agent</Text>
              <Text style={styles.cardTitle}>Talk through today&apos;s check-in</Text>
              <Text style={styles.cardBody}>
                Use the voice tab when you want Vela to listen for the clinical
                context a quick slider can miss.
              </Text>
            </View>
            <Pressable
              style={styles.voiceButton}
              onPress={() => router.navigate('/(conversation)/voice')}
            >
              <Text style={styles.voiceButtonText}>Open Voice</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(150).duration(450)}
            style={styles.chartCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>Overall wellbeing</Text>
              <Text style={styles.cardTitle}>Recovery trend over time</Text>
              <Text style={styles.cardBody}>
                Defaulting to one week, with a view out across the last several
                months as patterns build.
              </Text>
            </View>

            <View style={styles.timeframeRow}>
              {timeframeOptions.map((option) => {
                const selected = option.key === selectedTimeframe;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.timeframeChip,
                      selected && styles.timeframeChipActive,
                    ]}
                    onPress={() => setSelectedTimeframe(option.key)}
                  >
                    <Text
                      style={[
                        styles.timeframeLabel,
                        selected && styles.timeframeLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Current</Text>
                <Text style={styles.statValue}>
                  {currentScore === null ? '--' : `${currentScore}/100`}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={styles.statValue}>
                  {averageScore === null ? '--' : `${averageScore}/100`}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Trend</Text>
                <Text style={styles.statValue}>
                  {change === null
                    ? '--'
                    : `${change >= 0 ? '+' : ''}${change}`}
                </Text>
              </View>
            </View>

            {hasChartData ? (
              <WellbeingChart data={chartData} />
            ) : (
              <View style={styles.emptyChartState}>
                <Text style={styles.emptyChartTitle}>No survey scores yet</Text>
                <Text style={styles.emptyChartBody}>
                  Daily survey results saved on this phone will show up here and
                  be passed into Vela as recent context.
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).duration(450)}>
            <Text style={styles.sectionEyebrow}>Today&apos;s survey</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(420)}>
            <DailySurvey />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  glowPrimary: {
    position: 'absolute',
    top: -80,
    right: -30,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(127,119,221,0.24)',
  },
  glowSecondary: {
    position: 'absolute',
    top: 260,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(29,158,117,0.16)',
  },
  safe: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 148,
    gap: 18,
  },
  eyebrow: {
    color: 'rgba(197,193,245,0.58)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F4EFFC',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    marginTop: 10,
  },
  subtitle: {
    color: 'rgba(240,238,248,0.72)',
    fontSize: 17,
    lineHeight: 28,
    marginTop: 12,
    maxWidth: 680,
  },
  voiceCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(18,18,29,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(197,193,245,0.1)',
    gap: 18,
  },
  voiceCardCopy: {
    gap: 8,
  },
  cardHeader: {
    gap: 8,
    marginBottom: 8,
  },
  cardEyebrow: {
    color: 'rgba(247,226,197,0.78)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#F4EFFC',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  cardBody: {
    color: 'rgba(240,238,248,0.66)',
    fontSize: 15,
    lineHeight: 24,
  },
  voiceButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#C5C1F5',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  voiceButtonText: {
    color: '#0A0A12',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chartCard: {
    borderRadius: 32,
    padding: 22,
    backgroundColor: 'rgba(14,14,23,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(197,193,245,0.12)',
    gap: 18,
  },
  timeframeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeframeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  timeframeChipActive: {
    backgroundColor: 'rgba(197,193,245,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(197,193,245,0.26)',
  },
  timeframeLabel: {
    color: 'rgba(240,238,248,0.62)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  timeframeLabelActive: {
    color: '#F4EFFC',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 4,
  },
  statLabel: {
    color: 'rgba(240,238,248,0.58)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#F7E2C5',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  emptyChartState: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 8,
  },
  emptyChartTitle: {
    color: '#F4EFFC',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  emptyChartBody: {
    color: 'rgba(240,238,248,0.66)',
    fontSize: 14,
    lineHeight: 22,
  },
  sectionEyebrow: {
    color: 'rgba(197,193,245,0.58)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 10,
  },
});
