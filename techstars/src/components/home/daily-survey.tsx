import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Fonts } from "@/constants/theme";
import { ReEntryColors } from "@/constants/vela-colors";
import { generateAndStoreSummary } from "@/services/daily-summary-generator";
import { detectFlags } from "@/services/flag-service";
import { computeRecoveryScore } from "@/services/recovery-score-service";
import {
	type CheckInRow,
	saveCheckIn,
} from "@/services/supabase/checkin-service";
import {
	saveFlag,
	saveRecoveryScore,
} from "@/services/supabase/recovery-score-supabase";
import { useAppStore } from "@/state/app-state";
import {
	getSurveyDateKey,
	type SurveyScores,
	useSurveyStore,
} from "@/state/survey-state";

const moodOptions = [
	{ value: 1, emoji: "😞", label: "Awful" },
	{ value: 2, emoji: "😕", label: "Low" },
	{ value: 3, emoji: "😐", label: "Okay" },
	{ value: 4, emoji: "🙂", label: "Good" },
	{ value: 5, emoji: "😊", label: "Great" },
] as const;

const anxietyLabels = [
	{ value: 1, label: "Not at all" },
	{ value: 2, label: "A little" },
	{ value: 3, label: "Moderate" },
	{ value: 4, label: "A lot" },
	{ value: 5, label: "Constantly" },
] as const;

const hopelessnessLabels = [
	{ value: 1, label: "Not at all" },
	{ value: 2, label: "Rarely" },
	{ value: 3, label: "Sometimes" },
	{ value: 4, label: "Often" },
	{ value: 5, label: "All the time" },
] as const;

const physicalFunctionLabels = [
	{ value: 1, label: "Not at all" },
	{ value: 2, label: "A little" },
	{ value: 3, label: "Moderately" },
	{ value: 4, label: "Mostly" },
	{ value: 5, label: "Fully" },
] as const;

const sleepLabels = [
	{ value: 1, label: "Terrible" },
	{ value: 2, label: "Poor" },
	{ value: 3, label: "Fair" },
	{ value: 4, label: "Good" },
	{ value: 5, label: "Great" },
] as const;

const fatigueLabels = [
	{ value: 1, label: "Energized" },
	{ value: 2, label: "Mild" },
	{ value: 3, label: "Moderate" },
	{ value: 4, label: "High" },
	{ value: 5, label: "Exhausted" },
] as const;

const supportLabels = [
	{ value: 1, label: "Very alone" },
	{ value: 2, label: "Somewhat alone" },
	{ value: 3, label: "Neutral" },
	{ value: 4, label: "Supported" },
	{ value: 5, label: "Very supported" },
] as const;

const babyConfidenceLabels = [
	{ value: 1, label: "Not confident" },
	{ value: 2, label: "A little" },
	{ value: 3, label: "Somewhat" },
	{ value: 4, label: "Confident" },
	{ value: 5, label: "Very confident" },
] as const;

const painValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const hardestTags = [
	"Physical pain",
	"Exhaustion",
	"Loneliness",
	"Feeling overwhelmed",
	"Brain fog",
	"Work anxiety",
	"Missing baby",
] as const;

function toPositive100(value: number, min: number, max: number): number {
	return Math.round(((value - min) / (max - min)) * 100);
}

function toInverse100(value: number, min: number, max: number): number {
	return 100 - toPositive100(value, min, max);
}

function avg(values: (number | null)[]): number | null {
	const valid = values.filter(
		(v): v is number => typeof v === "number" && Number.isFinite(v),
	);
	if (valid.length === 0) return null;
	return Math.round(valid.reduce((s, v) => s + v, 0) / valid.length);
}

function computeSurveyScores(input: {
	mood: number | null;
	anxiety: number | null;
	hopelessness: number | null;
	pain: number | null;
	physicalFunction: number | null;
	sleepQuality: number | null;
	fatigue: number | null;
	support: number | null;
	babyCareConfidence: number | null;
}): SurveyScores {
	const scores: SurveyScores = {};

	const moodScore = avg([
		input.mood !== null ? toPositive100(input.mood, 1, 5) : null,
		input.hopelessness !== null ? toInverse100(input.hopelessness, 1, 5) : null,
	]);
	if (moodScore !== null) scores.moodDepression = moodScore;

	if (input.anxiety !== null) {
		scores.anxiety = toInverse100(input.anxiety, 1, 5);
	}

	const sleepScore = avg([
		input.sleepQuality !== null
			? toPositive100(input.sleepQuality, 1, 5)
			: null,
		input.fatigue !== null ? toInverse100(input.fatigue, 1, 5) : null,
	]);
	if (sleepScore !== null) scores.sleepFatigue = sleepScore;

	const physScore = avg([
		input.pain !== null ? toInverse100(input.pain, 0, 10) : null,
		input.physicalFunction !== null
			? toPositive100(input.physicalFunction, 1, 5)
			: null,
	]);
	if (physScore !== null) scores.physicalRecovery = physScore;

	const supScore = avg([
		input.support !== null ? toPositive100(input.support, 1, 5) : null,
		input.babyCareConfidence !== null
			? toPositive100(input.babyCareConfidence, 1, 5)
			: null,
	]);
	if (supScore !== null) scores.socialSupport = supScore;

	return scores;
}

function SectionTitle({ children }: { children: string }) {
	return <Text style={styles.sectionTitle}>{children}</Text>;
}

function QuestionLabel({ children }: { children: string }) {
	return <Text style={styles.questionLabel}>{children}</Text>;
}

function LabeledChoiceRow({
	options,
	selected,
	onSelect,
}: {
	options: readonly { label: string; value: number }[];
	selected: number | null;
	onSelect: (value: number) => void;
}) {
	return (
		<View style={styles.labeledChoiceWrap}>
			{options.map((option) => {
				const isSelected = option.value === selected;
				const isMultiWord = option.label.includes(" ");
				return (
					<Pressable
						key={option.value}
						style={[styles.labeledChip, isSelected && styles.labeledChipActive]}
						onPress={() => onSelect(option.value)}
					>
						<Text
							numberOfLines={isMultiWord ? 2 : 1}
							adjustsFontSizeToFit
							minimumFontScale={0.8}
							style={[
								styles.labeledChipText,
								isSelected && styles.labeledChipTextActive,
							]}
						>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function CompletedSummary({
	scores,
	onRedo,
}: {
	scores: SurveyScores;
	onRedo: () => void;
}) {
	const labels: { key: keyof SurveyScores; label: string }[] = [
		{ key: "moodDepression", label: "Mood" },
		{ key: "anxiety", label: "Anxiety" },
		{ key: "sleepFatigue", label: "Sleep" },
		{ key: "physicalRecovery", label: "Physical" },
		{ key: "socialSupport", label: "Support" },
	];

	return (
		<Animated.View entering={FadeIn.duration(400)} style={styles.summaryWrap}>
			<Text style={styles.summaryEmoji}>✓</Text>
			<Text style={styles.summaryTitle}>Today's check-in complete</Text>
			<View style={styles.summaryScoresWrap}>
				{labels.map(({ key, label }) => {
					const value = scores[key];
					if (typeof value !== "number") return null;
					return (
						<View key={key} style={styles.summaryScoreRow}>
							<Text style={styles.summaryScoreLabel}>{label}</Text>
							<View style={styles.summaryBarTrack}>
								<View style={[styles.summaryBarFill, { width: `${value}%` }]} />
							</View>
							<Text style={styles.summaryScoreValue}>{value}</Text>
						</View>
					);
				})}
			</View>
			<Pressable style={styles.redoButton} onPress={onRedo}>
				<Text style={styles.redoButtonText}>Redo check-in</Text>
			</Pressable>
		</Animated.View>
	);
}

export function DailySurvey() {
	const upsertSurveyScores = useSurveyStore((s) => s.upsertSurveyScores);
	const upsertSummary = useSurveyStore((s) => s.upsertSummary);
	const surveyHistory = useSurveyStore((s) => s.surveyHistory);
	const supabaseUserId = useAppStore((s) => s.supabaseUserId);
	const weeksPostpartum = useAppStore((s) => s.weeksPostpartum);
	const userName = useAppStore((s) => s.userName);

	const todayKey = getSurveyDateKey();
	const existingScores = surveyHistory[todayKey];
	const [forceRedo, setForceRedo] = useState(false);

	const [mood, setMood] = useState<number | null>(null);
	const [anxiety, setAnxiety] = useState<number | null>(null);
	const [hopelessness, setHopelessness] = useState<number | null>(null);
	const [pain, setPain] = useState<number | null>(null);
	const [physicalFunction, setPhysicalFunction] = useState<number | null>(null);
	const [sleepQuality, setSleepQuality] = useState<number | null>(null);
	const [fatigue, setFatigue] = useState<number | null>(null);
	const [support, setSupport] = useState<number | null>(null);
	const [babyCareConfidence, setBabyCareConfidence] = useState<number | null>(
		null,
	);
	const [hardestTag, setHardestTag] = useState<string | null>(null);
	const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
		"idle",
	);

	const alreadyCompleted =
		existingScores && Object.keys(existingScores).length > 0 && !forceRedo;

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset form state when the calendar date rolls over
	useEffect(() => {
		setForceRedo(false);
		setSaveState("idle");
	}, [todayKey]);

	async function handleSave() {
		setSaveState("saving");

		const scores = computeSurveyScores({
			mood,
			anxiety,
			hopelessness,
			pain,
			physicalFunction,
			sleepQuality,
			fatigue,
			support,
			babyCareConfidence,
		});

		upsertSurveyScores(todayKey, scores);

		if (supabaseUserId) {
			const row: CheckInRow = {
				mood,
				anxiety,
				hopelessness,
				pain,
				physical_function: physicalFunction,
				sleep_quality: sleepQuality,
				fatigue,
				support,
				baby_care_confidence: babyCareConfidence,
				hardest_tag: hardestTag,
			};
			await saveCheckIn(supabaseUserId, row);

			const recoveryResult = computeRecoveryScore(scores, weeksPostpartum);
			if (recoveryResult) {
				saveRecoveryScore(supabaseUserId, recoveryResult);
			}

			const updatedHistory = { ...surveyHistory, [todayKey]: scores };
			const flags = detectFlags(updatedHistory, hopelessness);
			for (const flag of flags) {
				saveFlag(supabaseUserId, flag);
			}
		}

		setSaveState("saved");

		const updatedHistoryForSummary = { ...surveyHistory, [todayKey]: scores };
		generateAndStoreSummary({
			scores,
			recoveryResult: computeRecoveryScore(scores, weeksPostpartum),
			hardestTag,
			surveyHistory: updatedHistoryForSummary,
			userName,
			supabaseUserId,
			upsertSummary,
		});
	}

	if (alreadyCompleted) {
		return (
			<CompletedSummary
				scores={existingScores}
				onRedo={() => setForceRedo(true)}
			/>
		);
	}

	if (saveState === "saved" && existingScores) {
		return (
			<CompletedSummary
				scores={existingScores}
				onRedo={() => {
					setForceRedo(true);
					setSaveState("idle");
				}}
			/>
		);
	}

	return (
		<ScrollView
			style={styles.scroll}
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
		>
			{/* Domain 2: Mental & Emotional */}
			<Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
				<SectionTitle>How you're feeling</SectionTitle>

				<QuestionLabel>How would you describe your mood today?</QuestionLabel>
				<View style={styles.moodRow}>
					{moodOptions.map((option) => {
						const isSelected = mood === option.value;
						return (
							<Pressable
								key={option.value}
								style={[styles.moodChip, isSelected && styles.moodChipActive]}
								onPress={() => setMood(option.value)}
							>
								<Text style={styles.moodEmoji}>{option.emoji}</Text>
								<Text
									style={[
										styles.moodLabel,
										isSelected && styles.chipTextActive,
									]}
								>
									{option.label}
								</Text>
							</Pressable>
						);
					})}
				</View>

				<QuestionLabel>
					How much has worry or anxiety affected you?
				</QuestionLabel>
				<LabeledChoiceRow
					options={anxietyLabels}
					selected={anxiety}
					onSelect={setAnxiety}
				/>

				<QuestionLabel>
					Have you felt down, hopeless, or that things aren't worth it?
				</QuestionLabel>
				<LabeledChoiceRow
					options={hopelessnessLabels}
					selected={hopelessness}
					onSelect={setHopelessness}
				/>
			</Animated.View>

			{/* Domain 1: Physical */}
			<Animated.View
				entering={FadeInDown.delay(60).duration(350)}
				style={styles.section}
			>
				<SectionTitle>Your body</SectionTitle>

				<QuestionLabel>
					How much has pain interfered with your day?
				</QuestionLabel>
				<View style={styles.painRow}>
					{painValues.map((v) => {
						const isSelected = pain === v;
						return (
							<Pressable
								key={v}
								style={[styles.painChip, isSelected && styles.painChipActive]}
								onPress={() => setPain(v)}
							>
								<Text
									style={[
										styles.painChipText,
										isSelected && styles.chipTextActive,
									]}
								>
									{v}
								</Text>
							</Pressable>
						);
					})}
				</View>
				<View style={styles.painScale}>
					<Text style={styles.painScaleLabel}>No pain</Text>
					<Text style={styles.painScaleLabel}>Worst</Text>
				</View>

				<QuestionLabel>
					How well could you do your usual activities?
				</QuestionLabel>
				<LabeledChoiceRow
					options={physicalFunctionLabels}
					selected={physicalFunction}
					onSelect={setPhysicalFunction}
				/>
			</Animated.View>

			{/* Domain 4: Sleep & Fatigue */}
			<Animated.View
				entering={FadeInDown.delay(120).duration(350)}
				style={styles.section}
			>
				<SectionTitle>Sleep and energy</SectionTitle>

				<QuestionLabel>How would you rate last night's sleep?</QuestionLabel>
				<LabeledChoiceRow
					options={sleepLabels}
					selected={sleepQuality}
					onSelect={setSleepQuality}
				/>

				<QuestionLabel>How fatigued do you feel right now?</QuestionLabel>
				<LabeledChoiceRow
					options={fatigueLabels}
					selected={fatigue}
					onSelect={setFatigue}
				/>
			</Animated.View>

			{/* Domain 3: Motherhood & Support */}
			<Animated.View
				entering={FadeInDown.delay(180).duration(350)}
				style={styles.section}
			>
				<SectionTitle>Support and motherhood</SectionTitle>

				<QuestionLabel>How supported have you felt today?</QuestionLabel>
				<LabeledChoiceRow
					options={supportLabels}
					selected={support}
					onSelect={setSupport}
				/>

				<QuestionLabel>
					How confident do you feel caring for your baby?
				</QuestionLabel>
				<LabeledChoiceRow
					options={babyConfidenceLabels}
					selected={babyCareConfidence}
					onSelect={setBabyCareConfidence}
				/>
			</Animated.View>

			{/* Qualitative */}
			<Animated.View
				entering={FadeInDown.delay(240).duration(350)}
				style={styles.section}
			>
				<SectionTitle>What's hardest right now?</SectionTitle>
				<View style={styles.tagWrap}>
					{hardestTags.map((tag) => {
						const isSelected = hardestTag === tag;
						return (
							<Pressable
								key={tag}
								style={[styles.tagChip, isSelected && styles.tagChipActive]}
								onPress={() => setHardestTag(tag)}
							>
								<Text
									style={[
										styles.tagChipText,
										isSelected && styles.chipTextActive,
									]}
								>
									{tag}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</Animated.View>

			<Pressable
				style={[
					styles.saveButton,
					saveState === "saving" && styles.saveButtonDisabled,
				]}
				onPress={handleSave}
				disabled={saveState === "saving"}
			>
				<Text style={styles.saveButtonText}>
					{saveState === "saving" ? "Saving..." : "Save check-in"}
				</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
	},
	container: {
		gap: 18,
		paddingBottom: 32,
	},
	section: {
		borderRadius: 20,
		padding: 22,
		backgroundColor: ReEntryColors.surface,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		gap: 14,
	},
	sectionTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 22,
		lineHeight: 28,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	questionLabel: {
		color: ReEntryColors.textPrimary,
		fontSize: 15,
		lineHeight: 22,
		fontWeight: "600",
		marginTop: 2,
	},

	moodRow: {
		flexDirection: "row",
		gap: 8,
	},
	moodChip: {
		flex: 1,
		borderRadius: 16,
		paddingVertical: 8,
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		backgroundColor: "rgba(44,31,26,0.04)",
		borderWidth: 1,
		borderColor: "transparent",
	},
	moodChipActive: {
		backgroundColor: "rgba(181,96,79,0.16)",
		borderColor: "rgba(181,96,79,0.26)",
	},
	moodEmoji: {
		fontSize: 24,
	},
	moodLabel: {
		color: ReEntryColors.textSecondary,
		fontSize: 11,
		fontWeight: "700",
	},

	labeledChoiceWrap: {
		flexDirection: "row",
		gap: 6,
	},
	labeledChip: {
		flex: 1,
		borderRadius: 20,
		paddingHorizontal: 6,
		paddingVertical: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(44,31,26,0.04)",
		borderWidth: 1,
		borderColor: "transparent",
	},
	labeledChipActive: {
		backgroundColor: "rgba(181,96,79,0.16)",
		borderColor: "rgba(181,96,79,0.26)",
	},
	labeledChipText: {
		color: ReEntryColors.textSecondary,
		fontSize: 12,
		fontWeight: "600",
		textAlign: "center",
	},
	labeledChipTextActive: {
		color: ReEntryColors.textPrimary,
	},

	painRow: {
		flexDirection: "row",
		gap: 4,
	},
	painChip: {
		flex: 1,
		aspectRatio: 1,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(44,31,26,0.04)",
		borderWidth: 1,
		borderColor: "transparent",
	},
	painChipActive: {
		backgroundColor: "rgba(181,96,79,0.16)",
		borderColor: "rgba(181,96,79,0.26)",
	},
	painChipText: {
		color: ReEntryColors.textSecondary,
		fontSize: 13,
		fontWeight: "700",
	},
	painScale: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: -6,
	},
	painScaleLabel: {
		color: ReEntryColors.textMuted,
		fontSize: 11,
		fontWeight: "600",
	},

	tagWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	tagChip: {
		flexGrow: 1,
		flexBasis: "46%",
		maxWidth: "48%",
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 8,
		alignItems: "center",
		backgroundColor: "rgba(44,31,26,0.04)",
		borderWidth: 1,
		borderColor: "transparent",
	},
	tagChipActive: {
		backgroundColor: "rgba(181,96,79,0.16)",
		borderColor: "rgba(181,96,79,0.26)",
	},
	tagChipText: {
		color: ReEntryColors.textSecondary,
		fontSize: 12,
		fontWeight: "600",
		textAlign: "center",
	},

	chipTextActive: {
		color: ReEntryColors.textPrimary,
	},

	saveButton: {
		borderRadius: 999,
		backgroundColor: ReEntryColors.primary,
		paddingHorizontal: 20,
		paddingVertical: 14,
		alignItems: "center",
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		color: ReEntryColors.white,
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.3,
	},

	summaryWrap: {
		alignItems: "center",
		paddingVertical: 32,
		paddingHorizontal: 20,
		gap: 14,
	},
	summaryEmoji: {
		fontSize: 44,
		color: ReEntryColors.success,
		fontWeight: "700",
	},
	summaryTitle: {
		color: ReEntryColors.textPrimary,
		fontSize: 22,
		fontWeight: "700",
		fontFamily: Fonts.serif,
		textAlign: "center",
	},
	summaryScoresWrap: {
		width: "100%",
		gap: 10,
		marginTop: 8,
	},
	summaryScoreRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	summaryScoreLabel: {
		width: 64,
		color: ReEntryColors.textSecondary,
		fontSize: 13,
		fontWeight: "600",
	},
	summaryBarTrack: {
		flex: 1,
		height: 8,
		borderRadius: 4,
		backgroundColor: ReEntryColors.surfaceRaised,
		overflow: "hidden",
	},
	summaryBarFill: {
		height: "100%",
		borderRadius: 4,
		backgroundColor: ReEntryColors.accentSoft,
	},
	summaryScoreValue: {
		width: 30,
		color: ReEntryColors.textPrimary,
		fontSize: 13,
		fontWeight: "700",
		textAlign: "right",
	},
	redoButton: {
		borderRadius: 999,
		paddingHorizontal: 20,
		paddingVertical: 12,
		backgroundColor: ReEntryColors.surfaceRaised,
		marginTop: 8,
	},
	redoButtonText: {
		color: ReEntryColors.textSecondary,
		fontSize: 14,
		fontWeight: "700",
	},
});
