import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { ORB_SIZE, OrbColors } from "@/constants/vela-colors";
import { useOrbStore } from "@/state/orb-state";
import { useVoiceStore } from "@/state/voice-state";
import { orbLayerStyle, useOrbAnimatedStyles } from "./orb-animations";

interface VelaOrbProps {
	onTap?: () => void;
	onDoubleTap?: () => void;
	onLongPress?: () => void;
}

export function VelaOrb({ onTap, onDoubleTap, onLongPress }: VelaOrbProps) {
	const orbState = useOrbStore((s) => s.state);
	const amplitude = useVoiceStore((s) => s.amplitude);

	const { outerContainerStyle, prevLayerStyle, currLayerStyle, glowStyle } =
		useOrbAnimatedStyles(orbState, amplitude);

	const colors = OrbColors[orbState];

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			onDoubleTap?.();
		})
		.runOnJS(true);

	const longPressGesture = Gesture.LongPress()
		.minDuration(800)
		.onStart(() => {
			onLongPress?.();
		})
		.runOnJS(true);

	const singleTapGesture = Gesture.Tap()
		.onEnd((_e, success) => {
			if (success) {
				onTap?.();
			}
		})
		.runOnJS(true);

	const composedGesture = Gesture.Exclusive(
		doubleTapGesture,
		longPressGesture,
		singleTapGesture,
	);

	return (
		<GestureDetector gesture={composedGesture}>
			<View style={styles.touchTarget}>
				{/* Outer glow halo */}
				<Animated.View
					style={[styles.glow, { shadowColor: colors.glow }, glowStyle]}
				/>

				{/* Animated orb container (scale + rotate) */}
				<Animated.View style={[styles.orbContainer, outerContainerStyle]}>
					{/* Outgoing color layer */}
					<Animated.View
						style={[orbLayerStyle, styles.orbLayer, prevLayerStyle]}
					/>

					{/* Incoming color layer (fades in on state change) */}
					<Animated.View
						style={[orbLayerStyle, styles.orbLayer, currLayerStyle]}
					/>

					{/* Specular highlight — simulates light source at top-left */}
					<View style={styles.specular} />
				</Animated.View>
			</View>
		</GestureDetector>
	);
}

const GLOW_SIZE = ORB_SIZE + 80;

const styles = StyleSheet.create({
	touchTarget: {
		width: GLOW_SIZE,
		height: GLOW_SIZE,
		alignItems: "center",
		justifyContent: "center",
	},
	glow: {
		position: "absolute",
		width: GLOW_SIZE,
		height: GLOW_SIZE,
		borderRadius: GLOW_SIZE / 2,
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 60,
		shadowOpacity: 1,
		// Android elevation-based glow approximation
		elevation: 20,
	},
	orbContainer: {
		width: ORB_SIZE,
		height: ORB_SIZE,
		alignItems: "center",
		justifyContent: "center",
	},
	orbLayer: {
		// Shared with orbLayerStyle — borderRadius + size
	},
	specular: {
		position: "absolute",
		top: ORB_SIZE * 0.12,
		left: ORB_SIZE * 0.18,
		width: 32,
		height: 20,
		borderRadius: 10,
		backgroundColor: "rgba(255,255,255,0.35)",
		// Soft blur simulation — no filter in RN without a library,
		// so we use a semi-transparent white ellipse instead
	},
});
