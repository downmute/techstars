import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import {
  registerForPushNotificationsAsync,
  scheduleDailyCheckIn,
} from '@/services/notifications/notification-service';
import { useAppStore } from '@/state/app-state';

export default function NotificationsScreen() {
  const checkInHour = useAppStore((s) => s.checkInHour);
  const checkInMinute = useAppStore((s) => s.checkInMinute);
  const setExpoPushToken = useAppStore((s) => s.setExpoPushToken);
  const setNotificationsEnabled = useAppStore(
    (s) => s.setNotificationsEnabled
  );

  async function handleAllow() {
    const result = await registerForPushNotificationsAsync();
    if (result.granted) {
      setExpoPushToken(result.pushToken);
      setNotificationsEnabled(true);
      await scheduleDailyCheckIn(checkInHour, checkInMinute);
    } else {
      setNotificationsEnabled(false);
      setExpoPushToken(null);
    }
    router.push('/onboarding/first-conversation');
  }

  function handleSkip() {
    setNotificationsEnabled(false);
    setExpoPushToken(null);
    router.push('/onboarding/first-conversation');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconArea}>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>

        <OnboardingHeader
          step={6}
          title="Allow gentle reminders"
          body="Vela uses notifications for daily check-ins and soft prompts. Nothing urgent, nothing alarming."
        />

        <Pressable style={styles.button} onPress={handleAllow}>
          <Text style={styles.buttonText}>Allow notifications</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Not right now</Text>
        </Pressable>
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
    paddingHorizontal: 36,
    gap: 24,
  },
  iconArea: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(197,193,245,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bellIcon: { fontSize: 36 },
  button: {
    backgroundColor: '#C5C1F5',
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 18,
    minWidth: 220,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#0A0A12', fontSize: 18, fontWeight: '600' },
  skipButton: { paddingVertical: 16, paddingHorizontal: 32 },
  skipText: { color: 'rgba(197,193,245,0.4)', fontSize: 16 },
});
