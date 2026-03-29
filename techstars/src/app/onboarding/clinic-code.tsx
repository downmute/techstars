import { router } from "expo-router";
import { useRef, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	type NativeSyntheticEvent,
	type TextInputKeyPressEventData,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReEntryColors } from "@/constants/vela-colors";
import { Fonts } from "@/constants/theme";
import { useAppStore } from "@/state/app-state";

const CODE_LENGTH = 5;

function ProgressDots({
	current,
	total,
}: { current: number; total: number }) {
	return (
		<View style={progressStyles.row}>
			{Array.from({ length: total }).map((_, i) => (
				<View
					key={i}
					style={[
						progressStyles.dot,
						{
							backgroundColor:
								i < current
									? ReEntryColors.primary
									: ReEntryColors.surfaceRaised,
							width: i < current ? 24 : 16,
						},
					]}
				/>
			))}
		</View>
	);
}

const progressStyles = StyleSheet.create({
	row: { flexDirection: "row", gap: 6, alignItems: "center" },
	dot: { height: 4, borderRadius: 2 },
});

function BackButton() {
	return (
		<Pressable onPress={() => router.back()} style={backStyles.circle}>
			<Text style={backStyles.chevron}>‹</Text>
		</Pressable>
	);
}

const backStyles = StyleSheet.create({
	circle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: ReEntryColors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	chevron: { fontSize: 22, color: ReEntryColors.textPrimary, marginTop: -2 },
});

export default function ClinicCodeScreen() {
	const [digits, setDigits] = useState<string[]>(
		Array(CODE_LENGTH).fill(""),
	);
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRefs = useRef<(TextInput | null)[]>([]);
	const setClinicCode = useAppStore((s) => s.setClinicCode);

	function handleChange(text: string, index: number) {
		const char = text.replace(/[^0-9A-Za-z]/g, "").slice(-1);
		const next = [...digits];
		next[index] = char.toUpperCase();
		setDigits(next);

		if (char && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
			setActiveIndex(index + 1);
		}
	}

	function handleKeyPress(
		e: NativeSyntheticEvent<TextInputKeyPressEventData>,
		index: number,
	) {
		if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
			setActiveIndex(index - 1);
			const next = [...digits];
			next[index - 1] = "";
			setDigits(next);
		}
	}

	function handleContinue() {
		const code = digits.join("");
		setClinicCode(code.length === CODE_LENGTH ? code : null);
		router.push("/onboarding/return-to-work");
	}

	function handleSkip() {
		setClinicCode(null);
		router.push("/onboarding/return-to-work");
	}

	const isFilled = digits.every((d) => d.length > 0);

	return (
		<SafeAreaView style={styles.container}>
			<Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
				<BackButton />
				<ProgressDots current={2} total={5} />
				<Text style={styles.stepLabel}>2 of 5</Text>
			</Animated.View>

			<View style={styles.content}>
				<Animated.View entering={FadeInDown.delay(100).duration(400)}>
					<Text style={styles.title}>Clinic code</Text>
					<Text style={styles.subtitle}>
						Enter the code from your provider to link your recovery.
					</Text>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(250).duration(400)}
					style={styles.codeRow}
				>
					{digits.map((digit, i) => (
						<TextInput
							key={i}
							ref={(ref) => {
								inputRefs.current[i] = ref;
							}}
							style={[
								styles.codeBox,
								activeIndex === i && styles.codeBoxActive,
								digit.length > 0 && styles.codeBoxFilled,
							]}
							value={digit}
							onChangeText={(t) => handleChange(t, i)}
							onKeyPress={(e) => handleKeyPress(e, i)}
							onFocus={() => setActiveIndex(i)}
							keyboardType="default"
							maxLength={2}
							autoCapitalize="characters"
							textAlign="center"
							autoFocus={i === 0}
						/>
					))}
				</Animated.View>

				<View style={styles.spacer} />

				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					style={styles.bottomArea}
				>
					<Pressable
						style={[styles.continueBtn, !isFilled && styles.btnDisabled]}
						onPress={handleContinue}
						disabled={!isFilled}
					>
						<Text style={styles.continueBtnText}>Continue</Text>
					</Pressable>
					<Pressable onPress={handleSkip} style={styles.skipBtn}>
						<Text style={styles.skipText}>I don&apos;t have a code</Text>
					</Pressable>
				</Animated.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: ReEntryColors.background },
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 16,
		gap: 16,
	},
	stepLabel: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		color: ReEntryColors.textMuted,
		marginLeft: "auto",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	title: {
		fontFamily: Fonts?.serif,
		fontSize: 32,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		marginBottom: 8,
	},
	subtitle: {
		fontFamily: Fonts?.sans,
		fontSize: 16,
		color: ReEntryColors.textSecondary,
		lineHeight: 22,
		marginBottom: 36,
	},
	codeRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
	},
	codeBox: {
		width: 52,
		height: 56,
		borderRadius: 12,
		backgroundColor: ReEntryColors.surface,
		fontSize: 24,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		borderWidth: 1.5,
		borderColor: "transparent",
	},
	codeBoxActive: {
		borderColor: ReEntryColors.primary,
	},
	codeBoxFilled: {
		backgroundColor: ReEntryColors.surfaceRaised,
	},
	spacer: { flex: 1 },
	bottomArea: {
		paddingBottom: 16,
		gap: 16,
		alignItems: "center",
	},
	continueBtn: {
		backgroundColor: ReEntryColors.accentSoft,
		borderRadius: 999,
		paddingVertical: 18,
		alignItems: "center",
		width: "100%",
	},
	btnDisabled: {
		opacity: 0.4,
	},
	continueBtnText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.white,
		fontSize: 16,
		fontWeight: "600",
	},
	skipBtn: {
		paddingVertical: 12,
	},
	skipText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.primary,
		fontSize: 15,
		fontWeight: "500",
	},
});
