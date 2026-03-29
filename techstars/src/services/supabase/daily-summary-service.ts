import { supabase } from "@/lib/supabase";

/**
 * Upserts the patient-facing daily summary to the `daily_summaries` table.
 * Uses the (user_id, date) unique constraint so re-generating the same day
 * overwrites the previous entry. Best-effort — never throws.
 */
export async function saveDailySummary(
	userId: string,
	summaryText: string,
): Promise<boolean> {
	const today = new Date().toISOString().slice(0, 10);

	const { error } = await supabase.from("daily_summaries").upsert(
		{
			user_id: userId,
			date: today,
			user_summary: summaryText,
		},
		{ onConflict: "user_id,date" },
	);

	if (error) {
		console.warn("[Supabase] saveDailySummary failed:", error.message);
		return false;
	}
	return true;
}

/**
 * Fetches the patient-facing summary for a specific date (defaults to today).
 * Returns null if none exists or the request fails.
 */
export async function getDailySummary(
	userId: string,
	date?: string,
): Promise<string | null> {
	const target = date ?? new Date().toISOString().slice(0, 10);

	const { data, error } = await supabase
		.from("daily_summaries")
		.select("user_summary")
		.eq("user_id", userId)
		.eq("date", target)
		.maybeSingle();

	if (error) {
		console.warn("[Supabase] getDailySummary failed:", error.message);
		return null;
	}
	return (data?.user_summary as string) ?? null;
}

interface SummaryRow {
	date: string;
	user_summary: string;
}

/**
 * Fetches the most recent N patient-facing summaries, newest first.
 * Returns an empty array on failure.
 */
export async function getRecentSummaries(
	userId: string,
	limit = 7,
): Promise<SummaryRow[]> {
	const { data, error } = await supabase
		.from("daily_summaries")
		.select("date, user_summary")
		.eq("user_id", userId)
		.not("user_summary", "is", null)
		.order("date", { ascending: false })
		.limit(limit);

	if (error) {
		console.warn("[Supabase] getRecentSummaries failed:", error.message);
		return [];
	}
	return (data as SummaryRow[]) ?? [];
}
