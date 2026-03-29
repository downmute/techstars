import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { VelaOrb } from '@/components/orb/vela-orb';
import { LogPanel } from '@/components/conversation-log/log-panel';
import { SettingsSheet } from '@/components/settings/settings-sheet';
import { useConversationStore } from '@/state/conversation-state';
import { useVoiceStore } from '@/state/voice-state';
import { useVoicePipeline } from '@/hooks/use-voice-pipeline';

export default function VoiceScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const setLogOpen = useConversationStore((s) => s.setLogOpen);
  const isLogOpen = useConversationStore((s) => s.isLogOpen);
  const isRecording = useVoiceStore((s) => s.isRecording);
  const isSpeaking = useVoiceStore((s) => s.isSpeaking);

  const { cancelTurn, isListening, isPreparing } = useVoicePipeline();

  const swipeGesture = Gesture.Pan()
    .activeOffsetX(-20)
    .onEnd((e) => {
      if (e.translationX < -40 && !isLogOpen) {
        setLogOpen(true);
      }
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.orbArea}>
            <VelaOrb
              onDoubleTap={cancelTurn}
              onLongPress={() => setSettingsVisible(true)}
            />
            <Text style={styles.hint}>
              {isPreparing
                ? 'Preparing local voice...'
                : isSpeaking
                  ? 'Speaking back to you'
                  : isRecording
                    ? 'Listening for your next thought'
                    : isListening
                      ? 'Thinking with you'
                      : 'Voice paused'}
            </Text>
          </View>
        </SafeAreaView>

        <LogPanel />

        <SettingsSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  safe: {
    flex: 1,
  },
  orbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  hint: {
    color: 'rgba(197,193,245,0.35)',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
