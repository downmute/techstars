import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import { ReEntryColors, APP_BACKGROUND } from '@/constants/vela-colors';
import { Fonts } from '@/constants/theme';
import { VelaOrb } from '@/components/orb/vela-orb';

import { useVoiceStore } from '@/state/voice-state';
import { useVoicePipeline } from '@/hooks/use-voice-pipeline';

export default function VoiceScreen() {
  const isRecording = useVoiceStore((s) => s.isRecording);
  const isSpeaking = useVoiceStore((s) => s.isSpeaking);

  const { cancelTurn, isListening, isPreparing } = useVoicePipeline();

  const swipeGesture = Gesture.Pan()
    .activeOffsetX(-20)
    .onEnd((e) => {
      if (e.translationX < -40) {
        router.back();
      }
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <View style={styles.warmGlow} />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.topBar}>
            <View style={styles.spacer} />
            <Pressable
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.orbArea}>
            <VelaOrb onDoubleTap={cancelTurn} />
            <Text style={styles.prompt}>Let&apos;s talk about your day</Text>
            <Text style={styles.hint}>
              {isPreparing
                ? 'Preparing...'
                : isSpeaking
                  ? 'Speaking back to you'
                  : isRecording
                    ? 'Listening...'
                    : isListening
                      ? 'Thinking...'
                      : 'Tap to start'}
            </Text>
          </View>

          <View style={styles.bottomBar}>
            <Pressable style={styles.stopButton} onPress={cancelTurn}>
              <View style={styles.stopSquare} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  warmGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(232,196,184,0.15)',
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  spacer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ReEntryColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: ReEntryColors.textPrimary,
    fontWeight: '600',
  },
  orbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  prompt: {
    color: ReEntryColors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Fonts.serif,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  hint: {
    color: ReEntryColors.textMuted,
    fontSize: 14,
    letterSpacing: 0.6,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontFamily: Fonts.sans,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ReEntryColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: ReEntryColors.white,
  },
});
