import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export interface PushRegistrationResult {
  granted: boolean;
  pushToken: string | null;
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (finalStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, pushToken: null };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return { granted: true, pushToken: null };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { granted: true, pushToken: token.data };
  } catch {
    return { granted: true, pushToken: null };
  }
}

export async function scheduleDailyCheckIn(
  hour: number,
  minute: number
): Promise<void> {
  // Cancel any previously scheduled check-ins
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning! ☀️',
      body: "Vela is ready for your morning check-in. Tap to say hello.",
      data: { type: 'morning_checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelAllCheckIns(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
