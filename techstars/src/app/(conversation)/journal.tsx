import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { APP_BACKGROUND, ReEntryColors } from "@/constants/vela-colors";
import { computeRecoveryScore } from "@/services/recovery-score-service";
import { getCurrentWeeksPostpartum, useAppStore } from "@/state/app-state";
import { getSortedSurveyDates, useSurveyStore } from "@/state/survey-state";

function formatRelativeDate(dateKey: string): string {
	const today = new Date();
	const todayKey = [
		today.getFullYear(),
		String(today.getMonth() + 1).padStart(2, "0"),
		String(today.getDate()).padStart(2, "0"),
	].join("-");

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayKey = [
		yesterday.getFullYear(),
		String(yesterday.getMonth() + 1).padStart(2, "0"),
		String(yesterday.getDate()).padStart(2, "0"),
	].join("-");

	if (dateKey === todayKey) return "Today";
	if (dateKey === yesterdayKey) return "Yesterday";

	const parsed = new Date(`${dateKey}T12:00:00`);
	return parsed.toLocaleDateString("en-US", {
		weekday: "long",
	});
}

function getScoreColor(score: number): string {
	if (score >= 70) return ReEntryColors.success;
	if (score >= 50) return ReEntryColors.warning;
	return ReEntryColors.danger;
}

function getReflectionText(score: number): string {
	if (score >= 80)
		return "A strong day — your energy and mood are both tracking well.";
	if (score >= 70) return "Steady progress. You are building a good rhythm.";
	if (score >= 50)
		return "A mixed day \u2014 some ups and downs, which is completely normal.";
	return "A tougher day. Be gentle with yourself \u2014 recovery is not linear.";
}

export default function JournalScreen() {
	const weeksPostpartum = useAppStore((s) => getCurrentWeeksPostpartum(s));
	const surveyHistory = useSurveyStore((s) => s.surveyHistory);
	const summaryHistory = useSurveyStore((s) => s.summaryHistory);
	const dates = getSortedSurveyDates(surveyHistory).reverse();
	const recentDates = dates.slice(0, 7);

	const weekScores = recentDates
		.map(
			(date) =>
				computeRecoveryScore(surveyHistory[date] ?? {}, weeksPostpartum)
					?.overall ?? null,
		)
		.filter((s): s is number => s !== null);
	const weekAverage =
		weekScores.length > 0
			? Math.round(
					weekScores.reduce((sum, v) => sum + v, 0) / weekScores.length,
				)
			: null;

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
						<Text style={styles.title}>Your journal</Text>
						<Text style={styles.filterLink}>This week</Text>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(80).duration(450)}
						style={styles.trendCard}
					>
						<Text style={styles.trendLabel}>7-DAY TREND</Text>
						<Text style={styles.trendTitle}>
							{weekAverage !== null
								? weekAverage >= 65
									? "Looking good"
									: "Keep going"
								: "No data yet"}
						</Text>
						{weekAverage !== null && (
							<Text style={styles.trendScore}>Average: {weekAverage}/100</Text>
						)}
					</Animated.View>

					{recentDates.length === 0 ? (
						<Animated.View
							entering={FadeInDown.delay(150).duration(450)}
							style={styles.emptyState}
						>
							<Text style={styles.emptyTitle}>No entries yet</Text>
							<Text style={styles.emptyBody}>
								Complete your first check-in to see your journal entries here.
							</Text>
						</Animated.View>
					) : (
						recentDates.map((dateKey, index) => {
							const scores = surveyHistory[dateKey] ?? {};
							const overall =
								computeRecoveryScore(scores, weeksPostpartum)?.overall ?? null;
							const displayDate = formatRelativeDate(dateKey);

							return (
								<Animated.View
									key={dateKey}
									entering={FadeInDown.delay(150 + index * 60).duration(420)}
									style={styles.entryCard}
								>
									<View style={styles.entryHeader}>
										<Text style={styles.entryDate}>{displayDate}</Text>
										{overall !== null && (
											<View
												style={[
													styles.scoreBadge,
													{ backgroundColor: getScoreColor(overall) },
												]}
											>
												<Text style={styles.scoreBadgeText}>{overall}</Text>
											</View>
										)}
									</View>
									<Text style={styles.entryBody}>
										{summaryHistory[dateKey]
											? summaryHistory[dateKey]
											: overall !== null
												? getReflectionText(overall)
												: "Partial check-in recorded."}
									</Text>
								</Animated.View>
							);
						})
					)}
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
		gap: 18,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
	},
	title: {
		color: ReEntryColors.textPrimary,
		fontSize: 32,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	filterLink: {
		color: ReEntryColors.primary,
		fontSize: 15,
		fontWeight: "600",
	},
	trendCard: {
		backgroundColor: ReEntryColors.primary,
		borderRadius: 20,
		padding: 22,
		gap: 8,
	},
	trendLabel: {
		color: "rgba(250,247,244,0.7)",
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1.4,
		textTransform: "uppercase",
		fontFamily: Fonts.sans,
	},
	trendTitle: {
		color: ReEntryColors.white,
		fontSize: 24,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	trendScore: {
		color: "rgba(250,247,244,0.65)",
		fontSize: 14,
		fontFamily: Fonts.sans,
	},
	entryCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 20,
		gap: 10,
	},
	entryHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	entryDate: {
		color: ReEntryColors.textPrimary,
		fontSize: 17,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	scoreBadge: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	scoreBadgeText: {
		color: ReEntryColors.white,
		fontSize: 13,
		fontWeight: "800",
		fontFamily: Fonts.sans,
	},
	entryBody: {
		color: ReEntryColors.textSecondary,
		fontSize: 15,
		lineHeight: 22,
		fontFamily: Fonts.sans,
	},
	emptyState: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		padding: 28,
		alignItems: "center",
		gap: 8,
	},
	emptyTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 18,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	emptyBody: {
		color: ReEntryColors.textSecondary,
		fontSize: 14,
		lineHeight: 20,
		textAlign: "center",
		fontFamily: Fonts.sans,
	},
});
