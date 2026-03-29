import { getLocalDateKey } from "@/lib/date-utils";
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
	const today = getLocalDateKey();

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
 * Upserts the clinician-facing clinical summary to the `daily_summaries` table.
 * Writes to the `clinical_summary` column on the same (user_id, date) row.
 * Best-effort — never throws.
 */
export async function saveClinicalSummary(
	userId: string,
	clinicalText: string,
): Promise<boolean> {
	const today = getLocalDateKey();

	const { error } = await supabase.from("daily_summaries").upsert(
		{
			user_id: userId,
			date: today,
			clinical_summary: clinicalText,
		},
		{ onConflict: "user_id,date" },
	);

	if (error) {
		console.warn("[Supabase] saveClinicalSummary failed:", error.message);
		return false;
	}
	return true;
}

/**
 * Fetches the patient-facing summary for a specific date (defaults to today).
 * Uses get_my_daily_summary RPC — never exposes clinical_summary to the client.
 */
export async function getDailySummary(
	_userId: string,
	date?: string,
): Promise<string | null> {
	const target = date ?? new Date().toISOString().slice(0, 10);

	const { data, error } = await supabase.rpc("get_my_daily_summary", {
		p_date: target,
	});

	if (error) {
		console.warn("[Supabase] getDailySummary failed:", error.message);
		return null;
	}
	return (data as string) ?? null;
}

interface SummaryRow {
	date: string;
	user_summary: string;
}

/**
 * Fetches the most recent N patient-facing summaries, newest first.
 * Uses get_my_recent_summaries RPC — never exposes clinical_summary to the client.
 */
export async function getRecentSummaries(
	_userId: string,
	limit = 7,
): Promise<SummaryRow[]> {
	const { data, error } = await supabase.rpc("get_my_recent_summaries", {
		p_limit: limit,
	});

	if (error) {
		console.warn("[Supabase] getRecentSummaries failed:", error.message);
		return [];
	}

	return ((data as { summary_date: string; user_summary: string }[]) ?? []).map(
		(row) => ({
			date: row.summary_date,
			user_summary: row.user_summary,
		}),
	);
}
