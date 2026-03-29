import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

import { useAppStore } from '@/state/app-state';
import { useOrbStore } from '@/state/orb-state';
import { areAllModelsDownloaded } from '@/services/models/model-manager';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const userName = useAppStore((s) => s.userName);
  const modelsDownloaded = useAppStore((s) => s.modelsDownloaded);
  const setModelsDownloaded = useAppStore((s) => s.setModelsDownloaded);
  const setOrbState = useOrbStore((s) => s.setState);
  const [hasRequiredModels, setHasRequiredModels] = useState(modelsDownloaded);
  const shouldShowOnboarding =
    !onboardingComplete || !userName?.trim() || !hasRequiredModels;

  // Handle notification taps
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          type?: string;
        };
        if (data?.type === 'morning_checkin') {
          setOrbState('checkin');
          router.replace('/(conversation)');
        }
      }
    );
    return () => sub.remove();
  }, [setOrbState]);

  useEffect(() => {
    let cancelled = false;

    async function verifyModels() {
      const downloaded = await areAllModelsDownloaded();
      if (cancelled) {
        return;
      }
      setHasRequiredModels(downloaded);
      setModelsDownloaded(downloaded);
    }

    void verifyModels();
    return () => {
      cancelled = true;
    };
  }, [setModelsDownloaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {shouldShowOnboarding ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <Stack.Screen name="(conversation)" />
        )}
      </Stack>
    </GestureHandlerRootView>
  );
}
