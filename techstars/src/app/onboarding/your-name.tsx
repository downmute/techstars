import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function YourNameScreen() {
  const [name, setName] = useState('');
  const setUserName = useAppStore((s) => s.setUserName);

  function handleContinue() {
    if (!name.trim()) return;
    setUserName(name.trim());
    router.push('/onboarding/about-you');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <OnboardingHeader
            step={3}
            title="What should Vela call you?"
            body="Use the name that feels most natural and comforting to hear."
          />

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="rgba(197,193,245,0.3)"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            maxLength={40}
          />

          <Pressable
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!name.trim()}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 28,
  },
  input: {
    color: '#F0EEF8',
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197,193,245,0.3)',
    paddingVertical: 12,
    width: '100%',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#C5C1F5',
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 18,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    color: '#0A0A12',
    fontSize: 18,
    fontWeight: '600',
  },
});
