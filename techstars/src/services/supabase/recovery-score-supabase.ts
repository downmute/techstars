import { getLocalDateKey } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";
import type { DetectedFlag } from "@/services/flag-service";
import type { RecoveryScoreResult } from "@/services/recovery-score-service";

/**
 * Upserts a daily recovery score to the `recovery_scores` table.
 * Uses the (user_id, date) unique constraint for conflict resolution.
 * Fails gracefully — the app continues offline.
 */
export async function saveRecoveryScore(
	userId: string,
	result: RecoveryScoreResult,
): Promise<boolean> {
	const today = getLocalDateKey();

	const { error } = await supabase.from("recovery_scores").upsert(
		{
			user_id: userId,
			date: today,
			overall_score: result.overall,
			physical_score: result.physical,
			mental_score: result.mental,
			sleep_score: result.sleep,
			support_score: result.support,
		},
		{ onConflict: "user_id,date" },
	);

	if (error) {
		console.warn("[Supabase] saveRecoveryScore failed:", error.message);
		return false;
	}
	return true;
}

/**
 * Inserts a flag into the `flags` table.
 * Each flag is a separate row — multiple flags can fire on the same day.
 * Fails gracefully — the app continues offline.
 */
export async function saveFlag(
	userId: string,
	flag: DetectedFlag,
): Promise<boolean> {
	const { error } = await supabase.from("flags").insert({
		user_id: userId,
		type: flag.type,
		severity: flag.severity,
		reason: flag.reason,
		differential: flag.differential,
		suggested_action: flag.suggestedAction,
	});

	if (error) {
		console.warn("[Supabase] saveFlag failed:", error.message);
		return false;
	}
	return true;
}
