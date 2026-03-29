import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { DownloadProgress } from '@/services/models/model-manager';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 320;
const STROKE_WIDTH = 3;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ModelDownloadProgressProps {
  progress: DownloadProgress | null;
}

function formatETA(seconds: number | null): string {
  if (seconds === null) return '';
  if (seconds < 60) return `${seconds}s remaining`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s remaining`;
}

export function ModelDownloadProgress({
  progress,
}: ModelDownloadProgressProps) {
  const strokeDashoffset = useSharedValue(CIRCUMFERENCE);

  useEffect(() => {
    if (progress) {
      const target = CIRCUMFERENCE * (1 - progress.overallPercent / 100);
      strokeDashoffset.value = withTiming(target, { duration: 300 });
    }
  }, [progress, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const percent = progress?.overallPercent ?? 0;
  const isDone = percent >= 100;

  return (
    <View style={styles.container}>
      {/* Progress ring */}
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      >
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(197,193,245,0.1)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={isDone ? '#1D9E75' : '#C5C1F5'}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>

      {/* Text overlay below ring */}
      <View style={styles.textBlock}>
        {isDone ? (
          <Text style={styles.doneText}>Vela is ready</Text>
        ) : (
          <>
            <Text style={styles.percentText}>{percent}%</Text>
            <Text style={styles.modelName}>
              {progress
                ? `${progress.modelDescription} (${progress.modelIndex} of ${progress.totalModels})`
                : 'Preparing…'}
            </Text>
            {progress?.estimatedSecondsRemaining != null && (
              <Text style={styles.eta}>
                {formatETA(progress.estimatedSecondsRemaining)}
              </Text>
            )}
            <Text style={styles.hint}>
              Stay on WiFi for best results. This only happens once.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
    // Offset below orb center
    marginTop: 120,
  },
  percentText: {
    color: '#C5C1F5',
    fontSize: 40,
    fontWeight: '200',
    letterSpacing: -1,
  },
  modelName: {
    color: 'rgba(197,193,245,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  eta: {
    color: 'rgba(197,193,245,0.4)',
    fontSize: 13,
  },
  hint: {
    color: 'rgba(197,193,245,0.3)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  doneText: {
    color: '#1D9E75',
    fontSize: 24,
    fontWeight: '300',
  },
});
