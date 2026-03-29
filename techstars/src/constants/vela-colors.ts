export type OrbStateValue =
	| "idle"
	| "listening"
	| "processing"
	| "speaking"
	| "checkin"
	| "error";

export interface OrbStateColors {
	primary: string;
	secondary: string;
	glow: string;
}

export const OrbColors: Record<OrbStateValue, OrbStateColors> = {
	idle: {
		primary: "#D4856A",
		secondary: "#E8C4B8",
		glow: "rgba(212,133,106,0.35)",
	},
	listening: {
		primary: "#FAF7F4",
		secondary: "#F0E9E2",
		glow: "rgba(250,247,244,0.5)",
	},
	processing: {
		primary: "#B5604F",
		secondary: "#D4856A",
		glow: "rgba(181,96,79,0.45)",
	},
	speaking: {
		primary: "#FDF8EE",
		secondary: "#F5E6C8",
		glow: "rgba(253,248,238,0.45)",
	},
	checkin: {
		primary: "#5A8A6A",
		secondary: "#7AA88A",
		glow: "rgba(90,138,106,0.4)",
	},
	error: {
		primary: "#B5404A",
		secondary: "#D4856A",
		glow: "rgba(181,64,74,0.2)",
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
export const APP_BACKGROUND = "#FAF7F4";

export const ReEntryColors = {
	background: "#FAF7F4",
	surface: "#F0E9E2",
	surfaceRaised: "#E8DDD4",
	primary: "#B5604F",
	accentSoft: "#D4856A",
	blush: "#E8C4B8",
	textPrimary: "#2C1F1A",
	textSecondary: "#8A6F65",
	textMuted: "#B39B93",
	border: "rgba(44,31,26,0.08)",
	success: "#5A8A6A",
	warning: "#C4925A",
	danger: "#B5404A",
	white: "#FAF7F4",
} as const;
