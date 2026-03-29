import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
} from 'react-native-svg';

export interface WellbeingPoint {
  label: string;
  value: number;
}

interface WellbeingChartProps {
  data: WellbeingPoint[];
}

const CHART_HEIGHT = 192;
const HORIZONTAL_PADDING = 20;
const VERTICAL_PADDING = 18;

export function WellbeingChart({ data }: WellbeingChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(Math.min(width - 64, 680), 260);
  const innerWidth = chartWidth - HORIZONTAL_PADDING * 2;
  const innerHeight = CHART_HEIGHT - VERTICAL_PADDING * 2;

  const points = data.map((point, index) => {
    const x =
      HORIZONTAL_PADDING +
      (innerWidth * index) / Math.max(data.length - 1, 1);
    const y =
      VERTICAL_PADDING + innerHeight - (point.value / 100) * innerHeight;

    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(CHART_HEIGHT - VERTICAL_PADDING).toFixed(2)} L ${points[0].x.toFixed(2)} ${(CHART_HEIGHT - VERTICAL_PADDING).toFixed(2)} Z`
    : '';

  const yGuides = [25, 50, 75];

  return (
    <View>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient
            id="wellbeingArea"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="rgba(197,193,245,0.42)" />
            <Stop offset="100%" stopColor="rgba(197,193,245,0.02)" />
          </LinearGradient>
          <LinearGradient
            id="wellbeingLine"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#C5C1F5" />
            <Stop offset="100%" stopColor="#F7E2C5" />
          </LinearGradient>
        </Defs>

        {yGuides.map((guide) => {
          const y =
            VERTICAL_PADDING + innerHeight - (guide / 100) * innerHeight;

          return (
            <Line
              key={guide}
              x1={HORIZONTAL_PADDING}
              x2={chartWidth - HORIZONTAL_PADDING}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 6"
              strokeWidth={1}
            />
          );
        })}

        {areaPath ? <Path d={areaPath} fill="url(#wellbeingArea)" /> : null}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke="url(#wellbeingLine)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={4}
          />
        ) : null}

        {points.map((point) => (
          <Circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            fill="#0A0A12"
            r={6}
            stroke="#F7E2C5"
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View style={styles.labelsRow}>
        {data.map((point) => (
          <Text key={point.label} style={styles.label}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  label: {
    flex: 1,
    color: 'rgba(240,238,248,0.58)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
