import { router } from "expo-router";
import { useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReEntryColors } from "@/constants/vela-colors";
import { Fonts } from "@/constants/theme";
import { useAppStore } from "@/state/app-state";
import type { WorkSetup } from "@/state/app-state";

const WORK_OPTIONS: { label: string; icon: string; value: WorkSetup }[] = [
	{ label: "Full-time office", icon: "💻", value: "full-time-office" },
	{ label: "Full-time remote", icon: "🏠", value: "full-time-remote" },
	{ label: "Part-time / hybrid", icon: "⏰", value: "part-time-hybrid" },
	{ label: "Not returning yet", icon: "🌿", value: "not-returning" },
];

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

export default function ReturnToWorkScreen() {
	const [date, setDate] = useState(
		useAppStore.getState().returnToWorkDate ?? "",
	);
	const [setup, setSetup] = useState<WorkSetup | null>(
		useAppStore.getState().workSetup,
	);

	const setReturnToWorkDate = useAppStore((s) => s.setReturnToWorkDate);
	const setWorkSetup = useAppStore((s) => s.setWorkSetup);

	function handleContinue() {
		setReturnToWorkDate(date.trim() || null);
		setWorkSetup(setup);
		router.push("/onboarding/notifications");
	}

	return (
		<SafeAreaView style={styles.container}>
			<Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
				<BackButton />
				<ProgressDots current={3} total={5} />
				<Text style={styles.stepLabel}>3 of 5</Text>
			</Animated.View>

			<ScrollView
				style={styles.flex}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown.delay(100).duration(400)}>
					<Text style={styles.title}>Return to work</Text>
					<Text style={styles.subtitle}>
						No rush — we&apos;ll pace things around you.
					</Text>
				</Animated.View>

				<Animated.View entering={FadeInDown.delay(200).duration(400)}>
					<Text style={styles.fieldLabel}>EXPECTED DATE</Text>
					<View style={styles.dateInputWrap}>
						<TextInput
							style={styles.dateInput}
							value={date}
							onChangeText={setDate}
							placeholder="June 15, 2026"
							placeholderTextColor={ReEntryColors.textMuted}
						/>
						<Text style={styles.calendarIcon}>📅</Text>
					</View>
				</Animated.View>

				<Animated.View entering={FadeInDown.delay(300).duration(400)}>
					<Text style={styles.fieldLabel}>WORK SETUP</Text>
					<View style={styles.optionsColumn}>
						{WORK_OPTIONS.map((opt) => {
							const selected = setup === opt.value;
							return (
								<Pressable
									key={opt.value}
									onPress={() => setSetup(opt.value)}
									style={[
										styles.optionCard,
										selected && styles.optionCardActive,
									]}
								>
									<Text style={styles.optionIcon}>{opt.icon}</Text>
									<Text
										style={[
											styles.optionLabel,
											selected && styles.optionLabelActive,
										]}
									>
										{opt.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</Animated.View>
			</ScrollView>

			<Animated.View
				entering={FadeInDown.delay(400).duration(400)}
				style={styles.bottomArea}
			>
				<Pressable style={styles.continueBtn} onPress={handleContinue}>
					<Text style={styles.continueBtnText}>Continue</Text>
				</Pressable>
			</Animated.View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: ReEntryColors.background },
	flex: { flex: 1 },
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
	scrollContent: {
		paddingHorizontal: 24,
		paddingBottom: 24,
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
		marginBottom: 32,
	},
	fieldLabel: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		fontWeight: "600",
		color: ReEntryColors.textSecondary,
		letterSpacing: 0.8,
		marginBottom: 10,
		marginTop: 8,
	},
	dateInputWrap: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: ReEntryColors.surface,
		borderRadius: 14,
		marginBottom: 24,
	},
	dateInput: {
		flex: 1,
		fontFamily: Fonts?.sans,
		paddingVertical: 16,
		paddingHorizontal: 18,
		fontSize: 16,
		color: ReEntryColors.textPrimary,
	},
	calendarIcon: {
		fontSize: 18,
		paddingRight: 16,
	},
	optionsColumn: {
		gap: 12,
	},
	optionCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: ReEntryColors.surface,
		borderRadius: 16,
		paddingVertical: 18,
		paddingHorizontal: 20,
		gap: 14,
		borderWidth: 1.5,
		borderColor: "transparent",
	},
	optionCardActive: {
		backgroundColor: ReEntryColors.accentSoft,
		borderColor: ReEntryColors.primary,
	},
	optionIcon: {
		fontSize: 22,
	},
	optionLabel: {
		fontFamily: Fonts?.sans,
		fontSize: 16,
		fontWeight: "500",
		color: ReEntryColors.textPrimary,
	},
	optionLabelActive: {
		color: ReEntryColors.white,
	},
	bottomArea: {
		paddingHorizontal: 24,
		paddingBottom: 16,
		paddingTop: 8,
	},
	continueBtn: {
		backgroundColor: ReEntryColors.accentSoft,
		borderRadius: 999,
		paddingVertical: 18,
		alignItems: "center",
	},
	continueBtnText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.white,
		fontSize: 16,
		fontWeight: "600",
	},
});
