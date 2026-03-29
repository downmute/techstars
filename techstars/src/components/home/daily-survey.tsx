import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts } from '@/constants/theme';
import {
  getSurveyDateKey,
  type SurveyScores,
  useSurveyStore,
} from '@/state/survey-state';

type WalkAbility = 'yes' | 'partial' | 'no' | null;
type Readiness = 'low' | 'medium' | 'high' | null;

const moodOptions = [
  { value: 1, label: '1', emoji: '😞' },
  { value: 2, label: '2', emoji: '😕' },
  { value: 3, label: '3', emoji: '😐' },
  { value: 4, label: '4', emoji: '🙂' },
  { value: 5, label: '5', emoji: '😊' },
] as const;

const painLocations = ['Incision', 'Perineal', 'Breast', 'Back'] as const;

const hardestTags = [
  'Brain fog',
  'Physical tiredness',
  'Missing baby',
  'Feeling behind',
  'Relationship with manager',
] as const;

function average(values: (number | null)[]): number | null {
  const present = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (present.length === 0) {
    return null;
  }

  return Math.round(
    present.reduce((sum, value) => sum + value, 0) / present.length
  );
}

function toPositiveHundredScale(
  value: number,
  min: number,
  max: number
): number {
  return Math.round(((value - min) / (max - min)) * 100);
}

function toInverseHundredScale(
  value: number,
  min: number,
  max: number
): number {
  return 100 - toPositiveHundredScale(value, min, max);
}

function parseHours(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function scoreHours(value: number | null, maxHours: number): number | null {
  if (value === null) {
    return null;
  }

  const normalized = Math.max(0, Math.min(value, maxHours));
  return Math.round((normalized / maxHours) * 100);
}

function computeSurveyScores(input: {
  mood: number | null;
  worry: number | null;
  hoursSlept: string;
  longestBlock: string;
  sleepQuality: number | null;
  fatigue: number | null;
  pain: number | null;
  walkAbility: WalkAbility;
  partnerSupport: number | null;
  familySupport: number | null;
  colleagueSupport: number | null;
  readiness: Readiness;
}): SurveyScores {
  const scores: SurveyScores = {};

  if (input.mood !== null) {
    scores.moodDepression = toPositiveHundredScale(input.mood, 1, 5);
  }

  if (input.worry !== null) {
    scores.anxiety = toInverseHundredScale(input.worry, 0, 10);
  }

  const sleepScore = average([
    scoreHours(parseHours(input.hoursSlept), 8),
    scoreHours(parseHours(input.longestBlock), 4),
    input.sleepQuality !== null
      ? toPositiveHundredScale(input.sleepQuality, 1, 5)
      : null,
    input.fatigue !== null ? toInverseHundredScale(input.fatigue, 1, 10) : null,
  ]);
  if (sleepScore !== null) {
    scores.sleepFatigue = sleepScore;
  }

  const walkScore =
    input.walkAbility === 'yes'
      ? 100
      : input.walkAbility === 'partial'
        ? 60
        : input.walkAbility === 'no'
          ? 20
          : null;
  const physicalScore = average([
    input.pain !== null ? toInverseHundredScale(input.pain, 0, 10) : null,
    walkScore,
  ]);
  if (physicalScore !== null) {
    scores.physicalRecovery = physicalScore;
  }

  const supportScore = average([
    input.partnerSupport !== null
      ? toPositiveHundredScale(input.partnerSupport, 1, 5)
      : null,
    input.familySupport !== null
      ? toPositiveHundredScale(input.familySupport, 1, 5)
      : null,
    input.colleagueSupport !== null
      ? toPositiveHundredScale(input.colleagueSupport, 1, 5)
      : null,
  ]);
  if (supportScore !== null) {
    scores.socialSupport = supportScore;
  }

  if (input.readiness) {
    scores.roleTransition =
      input.readiness === 'high'
        ? 100
        : input.readiness === 'medium'
          ? 65
          : 30;
  }

  return scores;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function QuestionLabel({ children }: { children: string }) {
  return <Text style={styles.questionLabel}>{children}</Text>;
}

function ChoiceRow<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.choiceWrap}>
      {options.map((option) => {
        const isSelected = option.value === selected;

        return (
          <Pressable
            key={String(option.value)}
            style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.choiceChipText,
                isSelected && styles.choiceChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DailySurvey() {
  const upsertSurveyScores = useSurveyStore((s) => s.upsertSurveyScores);
  const [mood, setMood] = useState<number | null>(null);
  const [worry, setWorry] = useState<number | null>(null);
  const [hoursSlept, setHoursSlept] = useState('');
  const [longestBlock, setLongestBlock] = useState('');
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [pain, setPain] = useState<number | null>(null);
  const [selectedPainLocations, setSelectedPainLocations] = useState<string[]>(
    []
  );
  const [walkAbility, setWalkAbility] = useState<WalkAbility>(null);
  const [partnerSupport, setPartnerSupport] = useState<number | null>(null);
  const [familySupport, setFamilySupport] = useState<number | null>(null);
  const [colleagueSupport, setColleagueSupport] = useState<number | null>(null);
  const [readiness, setReadiness] = useState<Readiness>(null);
  const [hardestTag, setHardestTag] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  function togglePainLocation(location: string) {
    setSelectedPainLocations((current) =>
      current.includes(location)
        ? current.filter((item) => item !== location)
        : [...current, location]
    );
  }

  function handleSave() {
    const dateKey = getSurveyDateKey();
    const scores = computeSurveyScores({
      mood,
      worry,
      hoursSlept,
      longestBlock,
      sleepQuality,
      fatigue,
      pain,
      walkAbility,
      partnerSupport,
      familySupport,
      colleagueSupport,
      readiness,
    });

    upsertSurveyScores(dateKey, scores);
    setSaveState('saved');
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <SectionTitle>Mood + depression</SectionTitle>
        <QuestionLabel>How would you describe your mood today?</QuestionLabel>
        <View style={styles.moodRow}>
          {moodOptions.map((option) => {
            const isSelected = mood === option.value;

            return (
              <Pressable
                key={option.value}
                style={[styles.moodChip, isSelected && styles.moodChipActive]}
                onPress={() => setMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && styles.choiceChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle>Anxiety</SectionTitle>
        <QuestionLabel>How much has worry affected you today?</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 11 }, (_, value) => ({
            label: String(value),
            value,
          }))}
          selected={worry}
          onSelect={setWorry}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle>Sleep + fatigue</SectionTitle>
        <QuestionLabel>Hours slept</QuestionLabel>
        <TextInput
          value={hoursSlept}
          onChangeText={setHoursSlept}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor="rgba(240,238,248,0.28)"
          style={styles.input}
        />

        <QuestionLabel>Longest continuous sleep block</QuestionLabel>
        <TextInput
          value={longestBlock}
          onChangeText={setLongestBlock}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor="rgba(240,238,248,0.28)"
          style={styles.input}
        />

        <QuestionLabel>Sleep quality</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 5 }, (_, index) => ({
            label: `${index + 1}`,
            value: index + 1,
          }))}
          selected={sleepQuality}
          onSelect={setSleepQuality}
        />

        <QuestionLabel>Fatigue right now</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 10 }, (_, index) => ({
            label: `${index + 1}`,
            value: index + 1,
          }))}
          selected={fatigue}
          onSelect={setFatigue}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle>Physical recovery</SectionTitle>
        <QuestionLabel>Pain score</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 11 }, (_, value) => ({
            label: String(value),
            value,
          }))}
          selected={pain}
          onSelect={setPain}
        />

        <QuestionLabel>Pain location</QuestionLabel>
        <View style={styles.choiceWrap}>
          {painLocations.map((location) => {
            const isSelected = selectedPainLocations.includes(location);

            return (
              <Pressable
                key={location}
                style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
                onPress={() => togglePainLocation(location)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    isSelected && styles.choiceChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <QuestionLabel>Can you walk for 10 minutes comfortably?</QuestionLabel>
        <ChoiceRow
          options={[
            { label: 'Yes', value: 'yes' as const },
            { label: 'Partial', value: 'partial' as const },
            { label: 'No', value: 'no' as const },
          ]}
          selected={walkAbility}
          onSelect={setWalkAbility}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle>Social support</SectionTitle>
        <QuestionLabel>Partner</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 5 }, (_, index) => ({
            label: `${index + 1}`,
            value: index + 1,
          }))}
          selected={partnerSupport}
          onSelect={setPartnerSupport}
        />

        <QuestionLabel>Family</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 5 }, (_, index) => ({
            label: `${index + 1}`,
            value: index + 1,
          }))}
          selected={familySupport}
          onSelect={setFamilySupport}
        />

        <QuestionLabel>Colleagues</QuestionLabel>
        <ChoiceRow
          options={Array.from({ length: 5 }, (_, index) => ({
            label: `${index + 1}`,
            value: index + 1,
          }))}
          selected={colleagueSupport}
          onSelect={setColleagueSupport}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle>Role transition + identity</SectionTitle>
        <QuestionLabel>Readiness for work today</QuestionLabel>
        <ChoiceRow
          options={[
            { label: 'Low', value: 'low' as const },
            { label: 'Medium', value: 'medium' as const },
            { label: 'High', value: 'high' as const },
          ]}
          selected={readiness}
          onSelect={setReadiness}
        />

        <QuestionLabel>What&apos;s hardest right now?</QuestionLabel>
        <View style={styles.choiceWrap}>
          {hardestTags.map((tag) => {
            const isSelected = hardestTag === tag;

            return (
              <Pressable
                key={tag}
                style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
                onPress={() => setHardestTag(tag)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    isSelected && styles.choiceChipTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save today&apos;s survey</Text>
      </Pressable>

      {saveState === 'saved' ? (
        <Text style={styles.savedText}>{getSurveyDateKey()} saved</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  section: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(17,17,28,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(197,193,245,0.1)',
    gap: 12,
  },
  sectionTitle: {
    color: '#F4EFFC',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  questionLabel: {
    color: '#F4EFFC',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodChip: {
    width: 58,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodChipActive: {
    backgroundColor: 'rgba(197,193,245,0.16)',
    borderColor: 'rgba(197,193,245,0.28)',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    color: 'rgba(240,238,248,0.68)',
    fontSize: 12,
    fontWeight: '700',
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  choiceChipActive: {
    backgroundColor: 'rgba(197,193,245,0.16)',
    borderColor: 'rgba(197,193,245,0.26)',
  },
  choiceChipText: {
    color: 'rgba(240,238,248,0.68)',
    fontSize: 14,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#F4EFFC',
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#F4EFFC',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 999,
    backgroundColor: '#C5C1F5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0A0A12',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  savedText: {
    color: 'rgba(247,226,197,0.82)',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
