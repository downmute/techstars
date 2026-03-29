import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { VelaOrb } from '@/components/orb/vela-orb';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <VelaOrb />

        <Animated.View
          entering={FadeIn.delay(900).duration(600).easing(Easing.out(Easing.quad))}
          style={styles.headerWrap}
        >
          <OnboardingHeader
            step={1}
            title="Meet Vela"
            body="A warm, voice-first companion that gets to know you over time."
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(1900).duration(500)}
        >
          <Pressable
            style={styles.button}
            onPress={() => router.push('/onboarding/sign-in')}
          >
            <Text style={styles.buttonText}>Get started</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 32,
  },
  headerWrap: {
    width: '100%',
  },
  button: {
    backgroundColor: '#C5C1F5',
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 18,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0A0A12',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
