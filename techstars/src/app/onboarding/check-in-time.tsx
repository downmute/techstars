import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_BACKGROUND } from '@/constants/vela-colors';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { useAppStore } from '@/state/app-state';

// 6:00am – 11:00am in 30-minute steps (11 options: steps 0-10)
const MIN_HOUR = 6;
const STEP_COUNT = 11; // 0-10 inclusive
const DEFAULT_STEP = 6; // 9:00am

function stepToTime(step: number): { hour: number; minute: number } {
  const totalMinutes = MIN_HOUR * 60 + step * 30;
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 };
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export default function CheckInTimeScreen() {
  const [step, setStep] = useState(DEFAULT_STEP);
  const [trackWidth, setTrackWidth] = useState(1);
  const setCheckInTime = useAppStore((s) => s.setCheckInTime);

  const thumbX = useSharedValue((DEFAULT_STEP / (STEP_COUNT - 1)) * trackWidth);

  const { hour, minute } = stepToTime(step);
  const timeLabel = formatTime(hour, minute);

  function handleLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    thumbX.value = (step / (STEP_COUNT - 1)) * w;
  }

  const panGestureWithStep = Gesture.Pan()
    .onEnd((e) => {
      const raw = Math.max(0, Math.min(trackWidth, e.absoluteX - 36));
      const fraction = raw / trackWidth;
      const snapped = Math.round(fraction * (STEP_COUNT - 1));
      setStep(snapped);
      thumbX.value = withSpring((snapped / (STEP_COUNT - 1)) * trackWidth);
    })
    .runOnJS(true);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - 16 }], // -16 to center 32dp thumb
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  function handleContinue() {
    setCheckInTime(hour, minute);
    router.push('/onboarding/notifications');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OnboardingHeader
          step={5}
          title="Choose your morning hello"
          body="Vela can gently greet you, share the day and weather, and ask how you're feeling."
        />

        <Text style={styles.timeDisplay}>{timeLabel}</Text>

        <View style={styles.sliderArea}>
          <Text style={styles.sliderEndLabel}>6 AM</Text>
          <GestureDetector gesture={panGestureWithStep}>
            <View
              style={styles.track}
              onLayout={handleLayout}
            >
              {/* Filled portion */}
              <Animated.View style={[styles.trackFill, fillStyle]} />
              {/* Snap dots */}
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.snapDot,
                    {
                      left: (i / (STEP_COUNT - 1)) * (trackWidth - 2) - 3,
                      backgroundColor: i <= step ? '#C5C1F5' : 'rgba(197,193,245,0.2)',
                    },
                  ]}
                />
              ))}
              {/* Thumb */}
              <Animated.View style={[styles.thumb, thumbStyle]} />
            </View>
          </GestureDetector>
          <Text style={styles.sliderEndLabel}>11 AM</Text>
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
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
    gap: 28,
  },
  timeDisplay: {
    color: '#C5C1F5',
    fontSize: 52,
    fontWeight: '200',
    letterSpacing: -1,
    marginVertical: 8,
  },
  sliderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  sliderEndLabel: {
    color: 'rgba(197,193,245,0.4)',
    fontSize: 13,
    width: 40,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 4,
    backgroundColor: 'rgba(197,193,245,0.1)',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#C5C1F5',
    borderRadius: 2,
    top: 20,
  },
  snapDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 19,
  },
  thumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5C1F5',
    top: 6,
    shadowColor: '#C5C1F5',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 4,
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
  buttonText: { color: '#0A0A12', fontSize: 18, fontWeight: '600' },
});
