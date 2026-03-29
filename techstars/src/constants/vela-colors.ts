export type OrbStateValue =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'checkin'
  | 'error';

export interface OrbStateColors {
  primary: string;
  secondary: string;
  glow: string;
}

export const OrbColors: Record<OrbStateValue, OrbStateColors> = {
  idle: {
    primary: '#C5C1F5',
    secondary: '#7F77DD',
    glow: 'rgba(197,193,245,0.35)',
  },
  listening: {
    primary: '#F5F3FF',
    secondary: '#EDE9FF',
    glow: 'rgba(245,243,255,0.5)',
  },
  processing: {
    primary: '#7F77DD',
    secondary: '#A89EE8',
    glow: 'rgba(127,119,221,0.45)',
  },
  speaking: {
    primary: '#FDF8EE',
    secondary: '#F5E6C8',
    glow: 'rgba(253,248,238,0.45)',
  },
  checkin: {
    primary: '#1D9E75',
    secondary: '#25C28F',
    glow: 'rgba(29,158,117,0.4)',
  },
  error: {
    primary: '#C5C1F5',
    secondary: '#A89EE8',
    glow: 'rgba(197,193,245,0.2)',
  },
};

export const OrbTiming = {
  idle: { pulseDuration: 3200, pulseScaleMin: 1.0, pulseScaleMax: 1.06 },
  listening: { pulseDuration: 800, pulseScaleMin: 1.0, pulseScaleMax: 1.14 },
  processing: { rotateDuration: 2200 },
  speaking: { amplitudeMultiplier: 0.18 },
  colorTransitionDuration: 400,
  glowTransitionDuration: 400,
};

export const ORB_SIZE = 240;
export const APP_BACKGROUND = '#0A0A12';
