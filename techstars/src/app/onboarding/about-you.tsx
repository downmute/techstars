import { router } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { ReEntryColors } from "@/constants/vela-colors";
import type { DeliveryType, FeedingMethod } from "@/state/app-state";
import { useAppStore } from "@/state/app-state";

const WEEKS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DELIVERY_OPTIONS: { label: string; value: DeliveryType }[] = [
	{ label: "Vaginal", value: "vaginal" },
	{ label: "C-Section", value: "c-section" },
];
const FEEDING_OPTIONS: { label: string; value: FeedingMethod }[] = [
	{ label: "Breast", value: "breast" },
	{ label: "Formula", value: "formula" },
	{ label: "Both", value: "both" },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
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

export default function AboutYouScreen() {
	const [name, setName] = useState(useAppStore.getState().userName ?? "");
	const [weeks, setWeeks] = useState<number | null>(
		useAppStore.getState().weeksPostpartum,
	);
	const [delivery, setDelivery] = useState<DeliveryType | null>(
		useAppStore.getState().deliveryType,
	);
	const [feeding, setFeeding] = useState<FeedingMethod | null>(
		useAppStore.getState().feedingMethod,
	);

	const setUserName = useAppStore((s) => s.setUserName);
	const setWeeksPostpartum = useAppStore((s) => s.setWeeksPostpartum);
	const setDeliveryType = useAppStore((s) => s.setDeliveryType);
	const setFeedingMethod = useAppStore((s) => s.setFeedingMethod);

	function handleContinue() {
		if (name.trim()) setUserName(name.trim());
		setWeeksPostpartum(weeks);
		setDeliveryType(delivery);
		setFeedingMethod(feeding);
		router.push("/onboarding/clinic-code");
	}

	const canContinue = name.trim().length > 0;

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
					<BackButton />
					<ProgressDots current={1} total={5} />
					<Text style={styles.stepLabel}>1 of 5</Text>
				</Animated.View>

				<ScrollView
					style={styles.flex}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<Animated.View entering={FadeInDown.delay(100).duration(400)}>
						<Text style={styles.title}>Tell us about you</Text>
						<Text style={styles.subtitle}>
							So we can personalize your experience.
						</Text>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(200).duration(400)}
						style={styles.card}
					>
						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>NAME</Text>
							<TextInput
								style={styles.input}
								value={name}
								onChangeText={setName}
								placeholder="Maria"
								placeholderTextColor={ReEntryColors.textMuted}
								autoCapitalize="words"
								maxLength={40}
							/>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>WEEKS POSTPARTUM</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.chipScroll}
							>
								{WEEKS_OPTIONS.map((w) => (
									<Pressable
										key={w}
										onPress={() => setWeeks(w)}
										style={[styles.chip, weeks === w && styles.chipActive]}
									>
										<Text
											style={[
												styles.chipText,
												weeks === w && styles.chipTextActive,
											]}
										>
											{w === 12 ? "12+" : String(w)}
										</Text>
									</Pressable>
								))}
							</ScrollView>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>DELIVERY TYPE</Text>
							<View style={styles.chipRow}>
								{DELIVERY_OPTIONS.map((opt) => (
									<Pressable
										key={opt.value}
										onPress={() => setDelivery(opt.value)}
										style={[
											styles.pillChip,
											delivery === opt.value && styles.chipActive,
										]}
									>
										<Text
											style={[
												styles.chipText,
												delivery === opt.value && styles.chipTextActive,
											]}
										>
											{opt.label}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.fieldLabel}>FEEDING</Text>
							<View style={styles.chipRow}>
								{FEEDING_OPTIONS.map((opt) => (
									<Pressable
										key={opt.value}
										onPress={() => setFeeding(opt.value)}
										style={[
											styles.pillChip,
											feeding === opt.value && styles.chipActive,
										]}
									>
										<Text
											style={[
												styles.chipText,
												feeding === opt.value && styles.chipTextActive,
											]}
										>
											{opt.label}
										</Text>
									</Pressable>
								))}
							</View>
						</View>
					</Animated.View>
				</ScrollView>

				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					style={styles.bottomArea}
				>
					<Pressable
						style={[styles.continueBtn, !canContinue && styles.btnDisabled]}
						onPress={handleContinue}
						disabled={!canContinue}
					>
						<Text style={styles.continueBtnText}>Continue</Text>
					</Pressable>
				</Animated.View>
			</KeyboardAvoidingView>
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
		marginBottom: 28,
		lineHeight: 22,
	},
	card: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 24,
		gap: 24,
	},
	fieldGroup: {
		gap: 10,
	},
	fieldLabel: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		fontWeight: "600",
		color: ReEntryColors.textSecondary,
		letterSpacing: 0.8,
	},
	input: {
		fontFamily: Fonts?.sans,
		backgroundColor: ReEntryColors.surfaceRaised,
		borderRadius: 14,
		paddingVertical: 16,
		paddingHorizontal: 18,
		fontSize: 16,
		color: ReEntryColors.textPrimary,
	},
	chipScroll: {
		gap: 8,
		paddingRight: 8,
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	chip: {
		backgroundColor: ReEntryColors.surfaceRaised,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 16,
		minWidth: 44,
		alignItems: "center",
	},
	pillChip: {
		backgroundColor: ReEntryColors.surfaceRaised,
		borderRadius: 999,
		paddingVertical: 12,
		paddingHorizontal: 22,
	},
	chipActive: {
		backgroundColor: ReEntryColors.primary,
	},
	chipText: {
		fontFamily: Fonts?.sans,
		fontSize: 15,
		fontWeight: "500",
		color: ReEntryColors.textPrimary,
	},
	chipTextActive: {
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
	btnDisabled: {
		opacity: 0.4,
	},
	continueBtnText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.white,
		fontSize: 16,
		fontWeight: "600",
	},
});
