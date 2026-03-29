import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ReEntryColors, APP_BACKGROUND } from '@/constants/vela-colors';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/state/app-state';

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: ReEntryColors.surfaceRaised,
          true: ReEntryColors.success,
        }}
        thumbColor={ReEntryColors.white}
      />
    </View>
  );
}

function formatDeliveryType(type: string | null): string | null {
  if (!type) return null;
  if (type === 'vaginal') return 'Vaginal';
  if (type === 'c-section') return 'C-section';
  return type;
}

function formatFeeding(method: string | null): string | null {
  if (!method) return null;
  if (method === 'breast') return 'Breastfeeding';
  if (method === 'formula') return 'Formula';
  if (method === 'both') return 'Both';
  return method;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(`${dateStr}T12:00:00`);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCheckInTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
}

export default function ProfileScreen() {
  const userName = useAppStore((s) => s.userName);
  const weeksPostpartum = useAppStore((s) => s.weeksPostpartum);
  const deliveryType = useAppStore((s) => s.deliveryType);
  const feedingMethod = useAppStore((s) => s.feedingMethod);
  const returnToWorkDate = useAppStore((s) => s.returnToWorkDate);
  const checkInHour = useAppStore((s) => s.checkInHour);
  const checkInMinute = useAppStore((s) => s.checkInMinute);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore(
    (s) => s.setNotificationsEnabled
  );
  const googleAccessToken = useAppStore((s) => s.googleAccessToken);

  const firstName = userName?.trim()?.split(' ')[0] || '';
  const initial = firstName.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(450)}
            style={styles.profileHeader}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.name}>{userName ?? 'User'}</Text>
            <Text style={styles.subtitle}>
              {weeksPostpartum !== null
                ? `${weeksPostpartum} weeks postpartum`
                : 'Postpartum recovery'}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(80).duration(450)}
            style={styles.card}
          >
            <InfoRow
              label="Delivery type"
              value={formatDeliveryType(deliveryType)}
            />
            <View style={styles.divider} />
            <InfoRow label="Feeding" value={formatFeeding(feedingMethod)} />
            <View style={styles.divider} />
            <InfoRow
              label="Return to work"
              value={formatDate(returnToWorkDate)}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(150).duration(450)}
            style={styles.card}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Google Calendar</Text>
              <View
                style={[
                  styles.connectionBadge,
                  googleAccessToken
                    ? styles.connectionConnected
                    : styles.connectionDisconnected,
                ]}
              >
                <Text
                  style={[
                    styles.connectionText,
                    googleAccessToken
                      ? styles.connectionTextConnected
                      : styles.connectionTextDisconnected,
                  ]}
                >
                  {googleAccessToken ? 'Connected' : 'Not connected'}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(450)}
            style={styles.card}
          >
            <InfoRow
              label="Check-in reminder"
              value={formatCheckInTime(checkInHour, checkInMinute)}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Notifications"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(280).duration(420)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              About ReEntry · Privacy · Support
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 20,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ReEntryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: ReEntryColors.white,
    fontSize: 26,
    fontWeight: '700',
    fontFamily: Fonts.serif,
  },
  name: {
    color: ReEntryColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.serif,
  },
  subtitle: {
    color: ReEntryColors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  card: {
    backgroundColor: ReEntryColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ReEntryColors.border,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    color: ReEntryColors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
  infoValue: {
    color: ReEntryColors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  divider: {
    height: 1,
    backgroundColor: ReEntryColors.border,
  },
  connectionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  connectionConnected: {
    backgroundColor: 'rgba(90,138,106,0.12)',
  },
  connectionDisconnected: {
    backgroundColor: 'rgba(44,31,26,0.05)',
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  connectionTextConnected: {
    color: ReEntryColors.success,
  },
  connectionTextDisconnected: {
    color: ReEntryColors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    color: ReEntryColors.textMuted,
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
});
