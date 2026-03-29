import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { useAppStore } from '@/state/app-state';
import { saveMemory } from '@/services/memory/memory-store';
import type { MemoryCategory } from '@/services/memory/memory-types';

interface Question {
  key: 'hometown' | 'favoriteThings' | 'importantPerson';
  prompt: string;
  category: MemoryCategory;
  placeholder: string;
  buildMemoryContent: (userName: string, value: string) => string;
  importanceScore: 1 | 2 | 3 | 4 | 5;
}

const QUESTIONS: Question[] = [
  {
    key: 'hometown',
    prompt: 'Where did you grow up?',
    category: 'life_story',
    placeholder: 'e.g. Savannah, Georgia',
    buildMemoryContent: (userName, value) =>
      `${userName} grew up in ${value}.`,
    importanceScore: 4,
  },
  {
    key: 'favoriteThings',
    prompt: 'What do you love to do?',
    category: 'preference',
    placeholder: 'e.g. Gardening, Frank Sinatra, and crosswords',
    buildMemoryContent: (userName, value) =>
      `${userName} loves ${value}.`,
    importanceScore: 4,
  },
  {
    key: 'importantPerson',
    prompt: 'Tell Vela one person who matters to you.',
    category: 'contact',
    placeholder: 'e.g. My daughter Sarah',
    buildMemoryContent: (userName, value) =>
      `${value} matters a lot to ${userName}.`,
    importanceScore: 5,
  },
];

export default function AboutYouScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const userName = useAppStore((s) => s.userName);
  const onboardingMemories = useAppStore((s) => s.onboardingMemories);
  const setOnboardingMemory = useAppStore((s) => s.setOnboardingMemory);

  const question = QUESTIONS[currentIndex];
  const currentAnswer = onboardingMemories[question.key];
  const isLast = currentIndex === QUESTIONS.length - 1;

  function setAnswer(text: string) {
    setOnboardingMemory(question.key, text);
  }

  async function handleNext() {
    if (!isLast) {
      advanceOrFinish();
      return;
    }

    setIsSaving(true);
    try {
      const displayName = userName?.trim() || 'User';
      await Promise.all(
        QUESTIONS.map(async (item) => {
          const value = onboardingMemories[item.key].trim();
          if (!value) return;

          await saveMemory({
            user_id: 'demo-user',
            category: item.category,
            content: item.buildMemoryContent(displayName, value),
            importance_score: item.importanceScore,
          });
        })
      );
      router.push('/onboarding/check-in-time');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSkip() {
    if (isLast) {
      void handleNext();
      return;
    }
    advanceOrFinish();
  }

  function advanceOrFinish() {
    if (isLast) {
      return;
    }

    // Fade transition to next question
    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i + 1);
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <RNAnimated.View style={[styles.content, { opacity: fadeAnim }]}>
          <OnboardingHeader
            step={4}
            title="Help Vela know you"
            body="A few details now will make your very first conversation feel warmer."
          />

          <Text style={styles.subStepLabel}>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </Text>

          <Text style={styles.question}>{question.prompt}</Text>

          <TextInput
            style={styles.input}
            value={currentAnswer}
            onChangeText={setAnswer}
            placeholder={question.placeholder}
            placeholderTextColor="rgba(197,193,245,0.25)"
            multiline
            numberOfLines={4}
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.skipBtn}
              onPress={handleSkip}
              disabled={isSaving}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable
              style={[
                styles.nextBtn,
                isSaving && styles.nextBtnDim,
              ]}
              onPress={handleNext}
              disabled={isSaving}
            >
              <Text style={styles.nextBtnText}>
                {isSaving ? 'Saving...' : isLast ? 'Continue' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BACKGROUND },
  inner: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(197,193,245,0.2)',
  },
  dotActive: {
    backgroundColor: '#C5C1F5',
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 40,
    gap: 20,
  },
  subStepLabel: {
    color: 'rgba(197,193,245,0.4)',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  question: {
    color: '#F0EEF8',
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 36,
  },
  input: {
    flex: 1,
    maxHeight: 200,
    color: '#F0EEF8',
    fontSize: 18,
    lineHeight: 28,
    borderWidth: 1,
    borderColor: 'rgba(197,193,245,0.15)',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(197,193,245,0.05)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    gap: 16,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  skipText: { color: 'rgba(197,193,245,0.4)', fontSize: 16 },
  nextBtn: {
    flex: 1,
    backgroundColor: '#C5C1F5',
    borderRadius: 32,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnDim: { opacity: 0.5 },
  nextBtnText: { color: '#0A0A12', fontSize: 18, fontWeight: '600' },
});
