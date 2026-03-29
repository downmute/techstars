import { router } from 'expo-router';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { useAppStore } from '@/state/app-state';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function SignInScreen() {
  const setGoogleAccessToken = useAppStore((s) => s.setGoogleAccessToken);

  const redirectUri = makeRedirectUri({ scheme: 'vela' });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: [
        'openid',
        'email',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
      redirectUri,
    },
    DISCOVERY
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
      }
      router.push('/onboarding/your-name');
    }
  }, [response, setGoogleAccessToken]);

  function handleSkip() {
    router.push('/onboarding/your-name');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OnboardingHeader
          step={2}
          title="Connect your calendar"
          body="Vela can gently remind you about upcoming plans and orient your morning check-in."
        />
        <Text style={styles.privacy}>
          Vela only reads your calendar — it never modifies or shares your
          events.
        </Text>

        <Pressable
          style={[styles.button, !request && styles.buttonDisabled]}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          {!request ? (
            <ActivityIndicator color="#0A0A12" />
          ) : (
            <Text style={styles.buttonText}>Continue with Google</Text>
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
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
    paddingHorizontal: 36,
    gap: 24,
  },
  privacy: {
    color: 'rgba(197,193,245,0.4)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#C5C1F5',
    borderRadius: 32,
    paddingHorizontal: 48,
    paddingVertical: 18,
    minWidth: 240,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0A0A12',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  skipText: {
    color: 'rgba(197,193,245,0.4)',
    fontSize: 16,
  },
});
