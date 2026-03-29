import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReEntryColors } from '@/constants/vela-colors';
import { useOrbStore } from '@/state/orb-state';
import type { OrbStateValue } from '@/constants/vela-colors';
import { useAppStore } from '@/state/app-state';
import { useConversationStore } from '@/state/conversation-state';
import { clearAllMemories } from '@/services/memory/memory-store';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const ORB_STATES: OrbStateValue[] = [
  'idle',
  'listening',
  'processing',
  'speaking',
  'checkin',
  'error',
];

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const insets = useSafeAreaInsets();
  const setOrbState = useOrbStore((s) => s.setState);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const setModelsDownloaded = useAppStore((s) => s.setModelsDownloaded);
  const clearSession = useConversationStore((s) => s.clearSession);

  async function handleRestartOnboarding() {
    resetOnboarding();
    clearSession();
    setOrbState('idle');
    await clearAllMemories();
    onClose();
    router.replace('/onboarding');
  }

  function handleRunModelSetup() {
    setModelsDownloaded(false);
    clearSession();
    setOrbState('idle');
    onClose();
    router.replace('/onboarding/first-conversation');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Developer Settings</Text>

        <Text style={styles.sectionLabel}>Orb State Preview</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stateRow}
        >
          {ORB_STATES.map((s) => (
            <Pressable
              key={s}
              style={styles.stateChip}
              onPress={() => {
                setOrbState(s);
                onClose();
              }}
            >
              <Text style={styles.stateChipText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Onboarding</Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            void handleRestartOnboarding();
          }}
        >
          <Text style={styles.actionButtonText}>Restart onboarding</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={handleRunModelSetup}
        >
          <Text style={styles.actionButtonText}>Run model setup again</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,31,26,0.5)',
  },
  sheet: {
    backgroundColor: ReEntryColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ReEntryColors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: ReEntryColors.surfaceRaised,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: ReEntryColors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionLabel: {
    color: ReEntryColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  stateRow: {
    gap: 8,
    paddingBottom: 8,
  },
  stateChip: {
    backgroundColor: ReEntryColors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: ReEntryColors.border,
  },
  stateChipText: {
    color: ReEntryColors.textPrimary,
    fontSize: 14,
  },
  actionButton: {
    marginTop: 4,
    backgroundColor: ReEntryColors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: ReEntryColors.border,
  },
  actionButtonText: {
    color: ReEntryColors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
});
