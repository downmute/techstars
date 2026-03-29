import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { VelaOrb } from '@/components/orb/vela-orb';
import { ModelDownloadProgress } from '@/components/onboarding/model-download-progress';
import { useAppStore } from '@/state/app-state';
import { useOrbStore } from '@/state/orb-state';
import {
  clearDownloadedModels,
  downloadAllModels,
  areAllModelsDownloaded,
  type DownloadProgress,
} from '@/services/models/model-manager';
import { initSTT, resetSTT } from '@/services/voice/stt-engine';
import { initTTS, speak } from '@/services/voice/tts-engine';
import {
  disposePocketTTSRuntime,
  isPocketTTSReady,
} from '@/services/voice/pocket-tts-runtime';
import {
  disposeSileroVadRuntime,
  initSileroVadRuntime,
} from '@/services/voice/silero-vad-runtime';

type Phase = 'checking' | 'downloading' | 'preparing' | 'greeting';
const RUNTIME_INIT_TIMEOUT_MS = 120000;

async function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export default function FirstConversationScreen() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const cancelRef = useRef({ cancelled: false });
  const runStartedRef = useRef(false);

  const userName = useAppStore((s) => s.userName);
  const onboardingMemories = useAppStore((s) => s.onboardingMemories);
  const setModelsDownloaded = useAppStore((s) => s.setModelsDownloaded);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const setOrbState = useOrbStore((s) => s.setState);

  useEffect(() => {
    async function prepareLocalVoice(): Promise<boolean> {
      resetSTT();
      disposePocketTTSRuntime();
      disposeSileroVadRuntime();
      console.log('[Onboarding] Preparing local STT runtime...');
      const sttReady = await withTimeout(initSTT(), 'Parakeet init', RUNTIME_INIT_TIMEOUT_MS);
      console.log(`[Onboarding] Parakeet ready: ${String(sttReady)}`);

      console.log('[Onboarding] Preparing local VAD runtime...');
      const vadReady = await withTimeout(
        initSileroVadRuntime(),
        'Silero VAD init',
        RUNTIME_INIT_TIMEOUT_MS
      );
      console.log(`[Onboarding] Silero VAD ready: ${String(vadReady)}`);

      console.log('[Onboarding] Preparing local TTS runtime...');
      const ttsReady = await withTimeout(
        initTTS().then(() => isPocketTTSReady()),
        'PocketTTS init',
        RUNTIME_INIT_TIMEOUT_MS
      );
      console.log(`[Onboarding] PocketTTS ready: ${String(ttsReady)}`);

      return sttReady && vadReady && ttsReady;
    }

    async function startGreeting() {
      setPhase('greeting');
      setOrbState('idle');

      // Brief pause before Vela speaks
      await new Promise((r) => setTimeout(r, 800));

      const greeting = userName
        ? buildGreeting(userName, onboardingMemories)
        : `Hi there. I'm Vela. It's wonderful to meet you. Just tap me whenever you'd like to chat.`;

      setOrbState('speaking');
      await speak(greeting);
      setOrbState('idle');

      // Mark onboarding complete and navigate to main app
      setOnboardingComplete(true);
      router.replace('/(conversation)');
    }

    async function checkAndDownload() {
      if (runStartedRef.current) {
        console.log('[Onboarding] Setup already in progress, skipping duplicate run');
        return;
      }
      runStartedRef.current = true;
      setOrbState('checkin');

      const alreadyDownloaded = await areAllModelsDownloaded();
      if (alreadyDownloaded) {
        setModelsDownloaded(true);
        setPhase('preparing');
        let ready = false;
        try {
          ready = await prepareLocalVoice();
        } catch (error) {
          console.warn('[Onboarding] Local runtime preparation failed:', error);
        }
        if (!ready) {
          await clearDownloadedModels();
          setModelsDownloaded(false);
          setDownloadError(
            'Your local voice models did not initialize correctly. Tap to redownload them.'
          );
          setOrbState('error');
          return;
        }
        await startGreeting();
        return;
      }

      setPhase('downloading');
      const result = await downloadAllModels(
        (p) => setProgress(p),
        cancelRef.current
      );

      if (!result.success) {
        setDownloadError(result.error ?? 'Download failed');
        setOrbState('error');
        return;
      }

      setModelsDownloaded(true);
      setPhase('preparing');
      let ready = false;
      try {
        ready = await prepareLocalVoice();
      } catch (error) {
        console.warn('[Onboarding] Local runtime preparation failed:', error);
      }
      if (!ready) {
        await clearDownloadedModels();
        setModelsDownloaded(false);
        setDownloadError(
          'Your local voice models did not initialize correctly. Tap to redownload them.'
        );
        setOrbState('error');
        return;
      }
      await startGreeting();
    }

    void checkAndDownload();
    return () => {
      cancelRef.current.cancelled = true;
      runStartedRef.current = false;
    };
  }, [
    onboardingMemories,
    retryNonce,
    setModelsDownloaded,
    setOnboardingComplete,
    setOrbState,
    userName,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {phase === 'downloading' ? (
          <View style={styles.downloadContainer}>
            <VelaOrb />
            <ModelDownloadProgress progress={progress} />
            <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
              <OnboardingHeader
                step={7}
                title="Setting up your Vela"
                body="Downloading the local voice tools that make conversations feel fast and natural."
              />
            </Animated.View>
          </View>
        ) : phase === 'preparing' ? (
          <View style={styles.downloadContainer}>
            <VelaOrb />
            <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
              <OnboardingHeader
                step={7}
                title="Preparing Vela's voice"
                body="Finishing local setup so speech stays on-device and feels fast."
              />
            </Animated.View>
          </View>
        ) : phase === 'greeting' ? (
          <View style={styles.greetingContainer}>
            <VelaOrb />
            <Animated.View entering={FadeIn.delay(600).duration(500)}>
              <Text style={styles.greetingText}>
                {userName ? `Hello, ${userName}` : 'Vela is ready'}
              </Text>
            </Animated.View>
          </View>
        ) : downloadError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Download failed</Text>
            <Text style={styles.errorBody}>{downloadError}</Text>
            <Text
              style={styles.retryText}
              onPress={() => {
                setDownloadError(null);
                cancelRef.current = { cancelled: false };
                setProgress(null);
                setPhase('checking');
                setRetryNonce((value) => value + 1);
              }}
            >
              Tap to retry
            </Text>
          </View>
        ) : (
          // Checking phase — orb in checkin state
          <VelaOrb />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_BACKGROUND },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  header: {
    width: '100%',
    paddingHorizontal: 32,
    marginTop: 20,
  },
  greetingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  greetingText: {
    color: 'rgba(197,193,245,0.6)',
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 16,
  },
  errorTitle: {
    color: '#F0EEF8',
    fontSize: 22,
    fontWeight: '300',
  },
  errorBody: {
    color: 'rgba(197,193,245,0.5)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryText: {
    color: '#C5C1F5',
    fontSize: 18,
    marginTop: 12,
  },
});

function buildGreeting(
  userName: string,
  memories: {
    hometown: string;
    favoriteThings: string;
    importantPerson: string;
  }
): string {
  const details = [
    memories.hometown.trim()
      ? `You grew up in ${memories.hometown.trim()}.`
      : null,
    memories.favoriteThings.trim()
      ? `You love ${memories.favoriteThings.trim()}.`
      : null,
    memories.importantPerson.trim()
      ? `${memories.importantPerson.trim()} matters a lot to you.`
      : null,
  ].filter(Boolean);

  const detailSentence =
    details.length > 0 ? ` ${details.slice(0, 2).join(' ')}` : '';

  return `Hi ${userName}. I'm Vela. It's lovely to meet you.${detailSentence} Just tap me whenever you'd like to chat.`;
}
