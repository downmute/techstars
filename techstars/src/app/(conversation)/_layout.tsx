import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ConversationLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </>
  );
}
