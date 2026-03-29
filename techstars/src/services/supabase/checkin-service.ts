import { supabase } from "@/lib/supabase";

export interface CheckInRow {
	mood: number | null;
	anxiety: number | null;
	hopelessness: number | null;
	pain: number | null;
	physical_function: number | null;
	sleep_quality: number | null;
	fatigue: number | null;
	support: number | null;
	baby_care_confidence: number | null;
	hardest_tag: string | null;
}

/**
 * Upserts a daily check-in to the `check_ins` table.
 * Uses the (user_id, date) unique constraint for conflict resolution so
 * re-submitting the same day overwrites the previous entry.
 * Returns true on success, false on failure (app continues offline).
 */
export async function saveCheckIn(
	userId: string,
	data: CheckInRow,
): Promise<boolean> {
	const today = new Date().toISOString().slice(0, 10);

	const { error } = await supabase.from("check_ins").upsert(
		{
			user_id: userId,
			date: today,
			...data,
		},
		{ onConflict: "user_id,date" },
	);

	if (error) {
		console.warn("[Supabase] saveCheckIn failed:", error.message);
		return false;
	}
	return true;
}

/**
 * Fetches the check-in for a specific date (defaults to today).
 * Returns null if no check-in exists or if the request fails.
 */
export async function getCheckInForDate(
	userId: string,
	date?: string,
): Promise<CheckInRow | null> {
	const target = date ?? new Date().toISOString().slice(0, 10);

	const { data, error } = await supabase
		.from("check_ins")
		.select(
			"mood, anxiety, hopelessness, pain, physical_function, sleep_quality, fatigue, support, baby_care_confidence, hardest_tag",
		)
		.eq("user_id", userId)
		.eq("date", target)
		.maybeSingle();

	if (error) {
		console.warn("[Supabase] getCheckInForDate failed:", error.message);
		return null;
	}

	return data as CheckInRow | null;
}
