import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReEntryColors } from "@/constants/vela-colors";
import { Fonts } from "@/constants/theme";
import {
	registerForPushNotificationsAsync,
	scheduleDailyCheckIn,
} from "@/services/notifications/notification-service";
import { useAppStore } from "@/state/app-state";

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

function clampHour(h: number): number {
	if (h < 1) return 12;
	if (h > 12) return 1;
	return h;
}

export default function NotificationsScreen() {
	const setExpoPushToken = useAppStore((s) => s.setExpoPushToken);
	const setNotificationsEnabled = useAppStore(
		(s) => s.setNotificationsEnabled,
	);
	const setCheckInTime = useAppStore((s) => s.setCheckInTime);

	const [displayHour, setDisplayHour] = useState(8);
	const [displayMinute] = useState(0);
	const [isAM, setIsAM] = useState(true);

	function get24Hour(): number {
		if (isAM) return displayHour === 12 ? 0 : displayHour;
		return displayHour === 12 ? 12 : displayHour + 12;
	}

	async function handleAllow() {
		const hour24 = get24Hour();
		setCheckInTime(hour24, displayMinute);

		const result = await registerForPushNotificationsAsync();
		if (result.granted) {
			setExpoPushToken(result.pushToken);
			setNotificationsEnabled(true);
			await scheduleDailyCheckIn(hour24, displayMinute);
		} else {
			setNotificationsEnabled(false);
			setExpoPushToken(null);
		}
		router.push("/onboarding/calendar");
	}

	function handleSkip() {
		setNotificationsEnabled(false);
		setExpoPushToken(null);
		router.push("/onboarding/calendar");
	}

	return (
		<SafeAreaView style={styles.container}>
			<Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
				<BackButton />
				<ProgressDots current={4} total={5} />
				<Text style={styles.stepLabel}>4 of 5</Text>
			</Animated.View>

			<View style={styles.content}>
				<Animated.View
					entering={FadeInDown.delay(100).duration(400)}
					style={styles.iconArea}
				>
					<Text style={styles.bellIcon}>🔔</Text>
				</Animated.View>

				<Animated.View entering={FadeInDown.delay(200).duration(400)}>
					<Text style={styles.title}>Stay on track</Text>
					<Text style={styles.subtitle}>
						A gentle daily reminder to check in. It takes under 2 minutes.
					</Text>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(300).duration(400)}
					style={styles.timeCard}
				>
					<View style={styles.timeRow}>
						<Pressable
							onPress={() => setDisplayHour(clampHour(displayHour - 1))}
							style={styles.timeAdjust}
						>
							<Text style={styles.timeAdjustText}>−</Text>
						</Pressable>

						<Text style={styles.timeDisplay}>
							{displayHour}:{String(displayMinute).padStart(2, "0")}
						</Text>

						<Pressable
							onPress={() => setDisplayHour(clampHour(displayHour + 1))}
							style={styles.timeAdjust}
						>
							<Text style={styles.timeAdjustText}>+</Text>
						</Pressable>

						<View style={styles.ampmRow}>
							<Pressable
								onPress={() => setIsAM(true)}
								style={[styles.ampmChip, isAM && styles.ampmChipActive]}
							>
								<Text
									style={[
										styles.ampmText,
										isAM && styles.ampmTextActive,
									]}
								>
									AM
								</Text>
							</Pressable>
							<Pressable
								onPress={() => setIsAM(false)}
								style={[styles.ampmChip, !isAM && styles.ampmChipActive]}
							>
								<Text
									style={[
										styles.ampmText,
										!isAM && styles.ampmTextActive,
									]}
								>
									PM
								</Text>
							</Pressable>
						</View>
					</View>
				</Animated.View>

				<View style={styles.spacer} />

				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					style={styles.bottomArea}
				>
					<Pressable style={styles.continueBtn} onPress={handleAllow}>
						<Text style={styles.continueBtnText}>Allow notifications</Text>
					</Pressable>
					<Pressable onPress={handleSkip} style={styles.skipBtn}>
						<Text style={styles.skipText}>Maybe later</Text>
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
	iconArea: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: ReEntryColors.surface,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	bellIcon: { fontSize: 32 },
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
	timeCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 24,
	},
	timeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
	},
	timeAdjust: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: ReEntryColors.surfaceRaised,
		alignItems: "center",
		justifyContent: "center",
	},
	timeAdjustText: {
		fontSize: 20,
		color: ReEntryColors.textPrimary,
		fontWeight: "500",
	},
	timeDisplay: {
		fontFamily: Fonts?.sans,
		fontSize: 44,
		fontWeight: "300",
		color: ReEntryColors.textPrimary,
		letterSpacing: -1,
	},
	ampmRow: {
		flexDirection: "column",
		gap: 4,
		marginLeft: 8,
	},
	ampmChip: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 10,
		backgroundColor: ReEntryColors.surfaceRaised,
	},
	ampmChipActive: {
		backgroundColor: ReEntryColors.primary,
	},
	ampmText: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		fontWeight: "600",
		color: ReEntryColors.textPrimary,
	},
	ampmTextActive: {
		color: ReEntryColors.white,
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
		color: ReEntryColors.textMuted,
		fontSize: 15,
	},
});
