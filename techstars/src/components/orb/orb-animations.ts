import { useEffect } from "react";
import {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

import {
	ORB_SIZE,
	OrbColors,
	type OrbStateValue,
	OrbTiming,
} from "@/constants/vela-colors";

// Glow box shadow is not animatable directly as a string, so we animate opacity
// of a separate glow View instead.

export function useOrbAnimatedStyles(
	orbState: OrbStateValue,
	amplitude: number,
) {
	// ---- shared values ----
	const pulseScale = useSharedValue(1);
	const rotateZ = useSharedValue(0);
	const incomingOpacity = useSharedValue(1);
	const glowOpacity = useSharedValue(0.6);

	// Track previous state to orchestrate cross-fade
	const prevState = useSharedValue<OrbStateValue>(orbState);
	const prevColor = useSharedValue(OrbColors[orbState]);
	const currColor = useSharedValue(OrbColors[orbState]);

	// Amplitude-driven scale (30fps updates from voice-state)
	const amplitudeDerived = useDerivedValue(
		() => 1.0 + amplitude * OrbTiming.speaking.amplitudeMultiplier,
		[amplitude],
	);

	// ---- state-driven animations ----
	useEffect(() => {
		cancelAnimation(pulseScale);
		cancelAnimation(rotateZ);

		switch (orbState) {
			case "idle":
				pulseScale.value = withRepeat(
					withSequence(
						withTiming(OrbTiming.idle.pulseScaleMax, {
							duration: OrbTiming.idle.pulseDuration / 2,
							easing: Easing.inOut(Easing.sin),
						}),
						withTiming(OrbTiming.idle.pulseScaleMin, {
							duration: OrbTiming.idle.pulseDuration / 2,
							easing: Easing.inOut(Easing.sin),
						}),
					),
					-1,
					false,
				);
				break;

			case "listening":
				pulseScale.value = withRepeat(
					withSequence(
						withTiming(OrbTiming.listening.pulseScaleMax, {
							duration: OrbTiming.listening.pulseDuration / 2,
							easing: Easing.inOut(Easing.quad),
						}),
						withTiming(OrbTiming.listening.pulseScaleMin, {
							duration: OrbTiming.listening.pulseDuration / 2,
							easing: Easing.inOut(Easing.quad),
						}),
					),
					-1,
					false,
				);
				break;

			case "processing":
				pulseScale.value = 1;
				rotateZ.value = withRepeat(
					withTiming(360, {
						duration: OrbTiming.processing.rotateDuration,
						easing: Easing.linear,
					}),
					-1,
					false,
				);
				break;

			case "speaking":
				// amplitude drives scale via amplitudeDerived; reset pulse
				pulseScale.value = withTiming(1, { duration: 200 });
				break;

			case "checkin":
				pulseScale.value = withRepeat(
					withSequence(
						withTiming(1.1, {
							duration: 1600,
							easing: Easing.inOut(Easing.sin),
						}),
						withTiming(1.0, {
							duration: 1600,
							easing: Easing.inOut(Easing.sin),
						}),
					),
					-1,
					false,
				);
				break;

			case "error":
				pulseScale.value = withRepeat(
					withSequence(
						withTiming(0.94, {
							duration: 600,
							easing: Easing.inOut(Easing.quad),
						}),
						withTiming(1.0, {
							duration: 600,
							easing: Easing.inOut(Easing.quad),
						}),
					),
					3,
					false,
				);
				break;
		}
	}, [orbState, pulseScale, rotateZ]);

	// ---- color cross-fade on state change ----
	useEffect(() => {
		if (prevState.value !== orbState) {
			prevColor.value = currColor.value;
			currColor.value = OrbColors[orbState];
			prevState.value = orbState;

			// Fade in new color layer
			incomingOpacity.value = 0;
			incomingOpacity.value = withTiming(1, {
				duration: OrbTiming.colorTransitionDuration,
			});

			// Glow transition
			glowOpacity.value = withTiming(orbState === "idle" ? 0.5 : 0.8, {
				duration: OrbTiming.glowTransitionDuration,
			});
		}
	}, [currColor, glowOpacity, incomingOpacity, orbState, prevColor, prevState]);

	// ---- animated styles ----
	const outerContainerStyle = useAnimatedStyle(() => ({
		transform: [
			{
				scale:
					orbState === "speaking" ? amplitudeDerived.value : pulseScale.value,
			},
			{ rotateZ: `${rotateZ.value}deg` },
		],
	}));

	const prevLayerStyle = useAnimatedStyle(() => ({
		opacity: 1 - incomingOpacity.value,
		experimental_backgroundImage: `radial-gradient(circle at 35% 30%, ${prevColor.value.primary}, ${prevColor.value.secondary} 80%)`,
	}));

	const currLayerStyle = useAnimatedStyle(() => ({
		opacity: incomingOpacity.value,
		experimental_backgroundImage: `radial-gradient(circle at 35% 30%, ${currColor.value.primary}, ${currColor.value.secondary} 80%)`,
	}));

	const glowStyle = useAnimatedStyle(() => ({
		opacity: glowOpacity.value,
	}));

	return { outerContainerStyle, prevLayerStyle, currLayerStyle, glowStyle };
}

// Static styles object for orb layers (sizes, border-radius, etc.)
export const orbLayerStyle = {
	width: ORB_SIZE,
	height: ORB_SIZE,
	borderRadius: ORB_SIZE / 2,
	position: "absolute" as const,
};
