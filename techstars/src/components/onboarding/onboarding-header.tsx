import { StyleSheet, Text, View } from 'react-native';

interface OnboardingHeaderProps {
  step: number;
  title: string;
  body?: string;
}

export function OnboardingHeader({
  step,
  title,
  body,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>{step} of 7</Text>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  stepLabel: {
    color: 'rgba(197,193,245,0.42)',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F0EEF8',
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 38,
  },
  body: {
    color: 'rgba(197,193,245,0.66)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
});
