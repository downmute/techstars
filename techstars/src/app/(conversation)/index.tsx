import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Fonts } from "@/constants/theme";
import { APP_BACKGROUND, ReEntryColors } from "@/constants/vela-colors";
import type { CalendarEvent } from "@/services/calendar/calendar-mock";
import { generateAndStoreRecommendation } from "@/services/calendar/calendar-recommendation";
import { getCalendarEvents } from "@/services/calendar/calendar-service";
import {
	computeRecoveryScore,
	type RecoveryScoreResult,
} from "@/services/recovery-score-service";
import { useAppStore } from "@/state/app-state";
import {
	getSortedSurveyDates,
	getSurveyDateKey,
	useSurveyStore,
} from "@/state/survey-state";

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

function RecoveryRing({ score }: { score: number | null }) {
	const size = 100;
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = score !== null ? score / 100 : 0;
	const strokeDashoffset = circumference * (1 - progress);

	return (
		<View style={ringStyles.container}>
			<Svg width={size} height={size}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={ReEntryColors.surfaceRaised}
					strokeWidth={strokeWidth}
					fill="none"
				/>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={ReEntryColors.primary}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="round"
					strokeDasharray={`${circumference} ${circumference}`}
					strokeDashoffset={strokeDashoffset}
					rotation={-90}
					origin={`${size / 2}, ${size / 2}`}
				/>
			</Svg>
			<View style={ringStyles.labelWrap}>
				<Text style={ringStyles.scoreText}>
					{score !== null ? score : "--"}
				</Text>
			</View>
		</View>
	);
}

const ringStyles = StyleSheet.create({
	container: {
		width: 100,
		height: 100,
		alignItems: "center",
		justifyContent: "center",
	},
	labelWrap: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	scoreText: {
		fontSize: 28,
		fontWeight: "700",
		fontFamily: Fonts.serif,
		color: ReEntryColors.textPrimary,
	},
});

function SubScoreBar({ label, value }: { label: string; value: number }) {
	return (
		<View style={subStyles.row}>
			<Text style={subStyles.label}>{label}</Text>
			<View style={subStyles.track}>
				<View style={[subStyles.fill, { width: `${Math.min(value, 100)}%` }]} />
			</View>
			<Text style={subStyles.value}>{value}</Text>
		</View>
	);
}

const subStyles = StyleSheet.create({
	row: { flexDirection: "row", alignItems: "center", gap: 8 },
	label: {
		width: 56,
		color: ReEntryColors.textSecondary,
		fontSize: 11,
		fontWeight: "600",
		fontFamily: Fonts.sans,
	},
	track: {
		flex: 1,
		height: 6,
		borderRadius: 3,
		backgroundColor: ReEntryColors.surfaceRaised,
		overflow: "hidden",
	},
	fill: {
		height: "100%",
		borderRadius: 3,
		backgroundColor: ReEntryColors.accentSoft,
	},
	value: {
		width: 26,
		color: ReEntryColors.textPrimary,
		fontSize: 11,
		fontWeight: "700",
		textAlign: "right",
		fontFamily: Fonts.sans,
	},
});

function formatEventTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function HomeScreen() {
	const userName = useAppStore((s) => s.userName);
	const weeksPostpartum = useAppStore((s) => s.weeksPostpartum);
	const googleAccessToken = useAppStore((s) => s.googleAccessToken);
	const calendarEvents = useAppStore((s) => s.calendarEvents);
	const calendarRecommendation = useAppStore((s) => s.calendarRecommendation);
	const calendarLastFetched = useAppStore((s) => s.calendarLastFetched);

	const surveyHistory = useSurveyStore((s) => s.surveyHistory);
	const summaryHistory = useSurveyStore((s) => s.summaryHistory);
	const dates = getSortedSurveyDates(surveyHistory);
	const todayKey = getSurveyDateKey();
	const todaySummary = summaryHistory[todayKey] ?? null;
	const hasCheckedInToday = Boolean(surveyHistory[todayKey]);
	const latestDate = dates[dates.length - 1];
	const latestScores = latestDate ? surveyHistory[latestDate] : undefined;
	const currentResult: RecoveryScoreResult | null = latestScores
		? computeRecoveryScore(latestScores, weeksPostpartum)
		: null;
	const currentScore = currentResult?.overall ?? null;

	const previousDate = dates.length >= 2 ? dates[dates.length - 2] : undefined;
	const previousScores = previousDate ? surveyHistory[previousDate] : undefined;
	const previousResult = previousScores
		? computeRecoveryScore(previousScores, weeksPostpartum)
		: null;
	const previousScore = previousResult?.overall ?? null;
	const change =
		currentScore !== null && previousScore !== null
			? currentScore - previousScore
			: null;

	const streakCount = dates.length;
	const firstName = userName?.trim()?.split(" ")[0] || "there";
	const hasFetchedRef = useRef(false);

	const todayDate = new Date().toISOString().slice(0, 10);
	const isCalendarStale = !calendarLastFetched?.startsWith(todayDate);
	const visibleEvents = isCalendarStale ? [] : calendarEvents;
	const visibleRecommendation = isCalendarStale ? null : calendarRecommendation;

	const fetchCalendar = useCallback(
		async (force = false) => {
			const state = useAppStore.getState();
			const today = new Date().toISOString().slice(0, 10);
			if (
				!force &&
				state.calendarLastFetched?.startsWith(today) &&
				state.calendarEvents.length > 0
			) {
				return;
			}

			const result = await getCalendarEvents(state.googleAccessToken, 24, () =>
				useAppStore.getState().setGoogleAccessToken(null),
			);
			useAppStore.getState().setCalendarEvents(result.events);
			useAppStore.getState().setCalendarLastFetched(new Date().toISOString());

			if (
				result.events.length > 0 &&
				(force || !useAppStore.getState().calendarRecommendation)
			) {
				generateAndStoreRecommendation({
					events: result.events,
					recoveryScore: currentScore,
					userName,
					setCalendarRecommendation:
						useAppStore.getState().setCalendarRecommendation,
				});
			}
		},
		[currentScore, userName],
	);

	useEffect(() => {
		if (!hasFetchedRef.current) {
			hasFetchedRef.current = true;
			fetchCalendar();
		}
	}, [fetchCalendar]);

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<Animated.View
						entering={FadeInDown.duration(450)}
						style={styles.header}
					>
						<View style={styles.headerLeft}>
							<Text style={styles.greeting}>{getGreeting()}</Text>
							<Text style={styles.name}>{firstName}</Text>
						</View>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{firstName.charAt(0).toUpperCase()}
							</Text>
						</View>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(80).duration(450)}
						style={styles.progressCard}
					>
						<View style={styles.progressRow}>
							<RecoveryRing score={currentScore} />
							<View style={styles.progressInfo}>
								<Text style={styles.progressTitle}>
									{currentScore !== null
										? "You're doing well"
										: "Start tracking"}
								</Text>
								<Text style={styles.progressBody}>
									{currentScore !== null
										? "Recovery trending up this week."
										: "Complete your first check-in to see progress."}
								</Text>
							</View>
						</View>
						<View style={styles.chipRow}>
							{change !== null && (
								<View
									style={[
										styles.chip,
										{
											backgroundColor:
												change >= 0
													? "rgba(90,138,106,0.15)"
													: "rgba(181,64,74,0.12)",
										},
									]}
								>
									<Text
										style={[
											styles.chipText,
											{
												color:
													change >= 0
														? ReEntryColors.success
														: ReEntryColors.danger,
											},
										]}
									>
										{change >= 0 ? "+" : ""}
										{change} pts
									</Text>
								</View>
							)}
							<View
								style={[
									styles.chip,
									{ backgroundColor: "rgba(232,196,184,0.3)" },
								]}
							>
								<Text
									style={[styles.chipText, { color: ReEntryColors.primary }]}
								>
									Day {Math.max(streakCount, 1)}
								</Text>
							</View>
						</View>
						{currentResult && (
							<View style={styles.subScoresWrap}>
								<SubScoreBar label="Physical" value={currentResult.physical} />
								<SubScoreBar label="Mental" value={currentResult.mental} />
								<SubScoreBar label="Sleep" value={currentResult.sleep} />
								<SubScoreBar label="Support" value={currentResult.support} />
							</View>
						)}
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(150).duration(450)}
						style={styles.reflectionCard}
					>
						<Text style={styles.reflectionLabel}>TODAY&apos;S REFLECTION</Text>
						{todaySummary ? (
							<Text style={styles.reflectionText}>{todaySummary}</Text>
						) : hasCheckedInToday ? (
							<Text style={styles.reflectionText}>
								Generating your reflection…
							</Text>
						) : (
							<>
								<Text style={styles.reflectionText}>
									Take a moment to check in with yourself today. Small steps
									build lasting change.
								</Text>
								<Text style={styles.reflectionHint}>
									Try a short walk after lunch today.
								</Text>
							</>
						)}
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(220).duration(450)}
						style={styles.actionRow}
					>
						<Pressable
							style={styles.actionCard}
							onPress={() => router.navigate("/(conversation)/checkin")}
						>
							<Text style={styles.actionTitle}>Check in</Text>
							<Text style={styles.actionSubtitle}>
								{streakCount > 0 ? `${streakCount}-day streak` : "Start today"}
							</Text>
						</Pressable>
						<Pressable
							style={styles.actionCard}
							onPress={() => router.navigate("/(conversation)/voice")}
						>
							<Text style={styles.actionTitle}>Voice</Text>
							<Text style={styles.actionSubtitle}>Talk it through</Text>
						</Pressable>
					</Animated.View>

					<Animated.View entering={FadeInDown.delay(280).duration(420)}>
						<View style={styles.calendarHeader}>
							<Text style={styles.calendarLabel}>TODAY</Text>
							{googleAccessToken && visibleEvents.length > 0 && (
								<Pressable onPress={() => fetchCalendar(true)}>
									<Text style={styles.calendarLink}>Refresh</Text>
								</Pressable>
							)}
						</View>
						{googleAccessToken ? (
							<View style={styles.calendarCard}>
								{visibleEvents.length > 0 ? (
									visibleEvents.map((event: CalendarEvent, idx: number) => (
										<View key={event.id}>
											{idx > 0 && <View style={styles.calendarDivider} />}
											<View style={styles.calendarItem}>
												<View
													style={[
														styles.calendarBorder,
														{
															backgroundColor: ReEntryColors.primary,
														},
													]}
												/>
												<View style={styles.calendarItemContent}>
													<Text
														style={styles.calendarItemTitle}
														numberOfLines={1}
													>
														{event.title}
													</Text>
													<Text style={styles.calendarItemTime}>
														{formatEventTime(event.start)}
													</Text>
												</View>
											</View>
										</View>
									))
								) : (
									<View style={styles.calendarItem}>
										<Text style={styles.calendarEmptyText}>
											No events today — enjoy the open space.
										</Text>
									</View>
								)}
								{visibleRecommendation && (
									<>
										<View style={styles.calendarDivider} />
										<View style={styles.calendarItem}>
											<View
												style={[
													styles.calendarBorder,
													{
														backgroundColor: ReEntryColors.success,
													},
												]}
											/>
											<View style={styles.calendarItemContent}>
												<Text
													style={styles.calendarRecommendationText}
													numberOfLines={3}
												>
													{visibleRecommendation}
												</Text>
											</View>
										</View>
									</>
								)}
							</View>
						) : (
							<Pressable
								style={styles.calendarConnectCard}
								onPress={() => router.navigate("/onboarding/calendar")}
							>
								<Text style={styles.calendarConnectIcon}>📅</Text>
								<View style={styles.calendarConnectContent}>
									<Text style={styles.calendarConnectTitle}>
										Connect your calendar
									</Text>
									<Text style={styles.calendarConnectSubtitle}>
										Get personalized break suggestions
									</Text>
								</View>
							</Pressable>
						)}
					</Animated.View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: APP_BACKGROUND,
	},
	safe: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 24,
		paddingTop: 18,
		paddingBottom: 120,
		gap: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	headerLeft: {
		flex: 1,
		gap: 4,
	},
	greeting: {
		color: ReEntryColors.textSecondary,
		fontSize: 13,
		fontWeight: "500",
		fontFamily: Fonts.sans,
	},
	name: {
		color: ReEntryColors.textPrimary,
		fontSize: 36,
		fontWeight: "700",
		fontFamily: Fonts.serif,
		lineHeight: 42,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: ReEntryColors.primary,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 4,
	},
	avatarText: {
		color: ReEntryColors.white,
		fontSize: 18,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	progressCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 20,
		gap: 16,
	},
	progressRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 18,
	},
	progressInfo: {
		flex: 1,
		gap: 6,
	},
	progressTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 20,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	progressBody: {
		color: ReEntryColors.textSecondary,
		fontSize: 14,
		lineHeight: 20,
		fontFamily: Fonts.sans,
	},
	chipRow: {
		flexDirection: "row",
		gap: 8,
	},
	chip: {
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	chipText: {
		fontSize: 13,
		fontWeight: "700",
		fontFamily: Fonts.sans,
	},
	subScoresWrap: {
		gap: 6,
		borderTopWidth: 1,
		borderTopColor: ReEntryColors.border,
		paddingTop: 14,
	},
	reflectionCard: {
		backgroundColor: ReEntryColors.primary,
		borderRadius: 20,
		padding: 22,
		gap: 12,
	},
	reflectionLabel: {
		color: "rgba(250,247,244,0.7)",
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1.4,
		textTransform: "uppercase",
		fontFamily: Fonts.sans,
	},
	reflectionText: {
		color: ReEntryColors.white,
		fontSize: 18,
		lineHeight: 26,
		fontWeight: "500",
		fontFamily: Fonts.serif,
	},
	reflectionHint: {
		color: "rgba(250,247,244,0.65)",
		fontSize: 14,
		lineHeight: 20,
		fontFamily: Fonts.sans,
	},
	actionRow: {
		flexDirection: "row",
		gap: 14,
	},
	actionCard: {
		flex: 1,
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 20,
		gap: 6,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 90,
	},
	actionIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: ReEntryColors.surfaceRaised,
		alignItems: "center",
		justifyContent: "center",
	},
	actionIcon: {
		fontSize: 20,
		color: ReEntryColors.textPrimary,
	},
	actionTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 19,
		fontWeight: "700",
		fontFamily: Fonts.serif,
		textAlign: "center",
	},
	actionSubtitle: {
		color: ReEntryColors.textSecondary,
		fontSize: 14,
		fontFamily: Fonts.sans,
		textAlign: "center",
	},
	calendarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 2,
	},
	calendarLabel: {
		color: ReEntryColors.textMuted,
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	calendarLink: {
		color: ReEntryColors.primary,
		fontSize: 14,
		fontWeight: "600",
	},
	calendarCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		overflow: "hidden",
	},
	calendarItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 18,
	},
	calendarBorder: {
		width: 3,
		height: 32,
		borderRadius: 2,
		marginRight: 14,
	},
	calendarItemContent: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	calendarItemTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 15,
		fontWeight: "600",
		fontFamily: Fonts.sans,
	},
	calendarItemTime: {
		color: ReEntryColors.textSecondary,
		fontSize: 13,
		fontFamily: Fonts.sans,
	},
	calendarDivider: {
		height: 1,
		backgroundColor: ReEntryColors.border,
		marginLeft: 35,
	},
	calendarEmptyText: {
		color: ReEntryColors.textSecondary,
		fontSize: 14,
		fontFamily: Fonts.sans,
	},
	calendarRecommendationText: {
		color: ReEntryColors.success,
		fontSize: 13,
		lineHeight: 18,
		fontFamily: Fonts.sans,
		flex: 1,
	},
	calendarConnectCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		borderStyle: "dashed",
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},
	calendarConnectIcon: {
		fontSize: 28,
	},
	calendarConnectContent: {
		flex: 1,
		gap: 2,
	},
	calendarConnectTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 15,
		fontWeight: "600",
		fontFamily: Fonts.sans,
	},
	calendarConnectSubtitle: {
		color: ReEntryColors.textSecondary,
		fontSize: 13,
		fontFamily: Fonts.sans,
	},
});
