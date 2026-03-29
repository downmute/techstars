import { supabase } from "@/lib/supabase";
import type { DeliveryType, FeedingMethod, WorkSetup } from "@/state/app-state";

export interface UserProfile {
	clinicCode: string | null;
	weeksPostpartum: number | null;
	deliveryType: DeliveryType | null;
	feedingMethod: FeedingMethod | null;
	returnToWorkDate: string | null;
	workSetup: WorkSetup | null;
}

function mapFeedingMethod(method: FeedingMethod | null): string | null {
	if (!method) return null;
	const map: Record<FeedingMethod, string> = {
		breast: "breastfeeding",
		formula: "formula",
		both: "mixed",
	};
	return map[method];
}

async function resolveClinicId(
	clinicCode: string | null,
): Promise<string | null> {
	if (!clinicCode?.trim()) return null;
	const { data } = await supabase
		.from("clinics")
		.select("id")
		.eq("name", clinicCode.trim())
		.maybeSingle();
	return data?.id ?? null;
}

/**
 * Signs the user in anonymously. Safe to call multiple times — if a session
 * already exists it returns the existing user ID without creating a new one.
 */
export async function signInAnonymously(): Promise<string | null> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session?.user) return session.user.id;

	const { data, error } = await supabase.auth.signInAnonymously();
	if (error) {
		console.warn("[Supabase] Anonymous sign-in failed:", error.message);
		return null;
	}
	return data.user?.id ?? null;
}

/**
 * Upserts the user's clinical profile to the `users` table.
 * Returns true on success, false if the write failed (app continues offline).
 */
export async function saveUserProfile(
	userId: string,
	profile: UserProfile,
): Promise<boolean> {
	const clinicId = await resolveClinicId(profile.clinicCode);

	const { error } = await supabase.from("users").upsert(
		{
			id: userId,
			clinic_id: clinicId,
			weeks_postpartum: profile.weeksPostpartum,
			delivery_type: profile.deliveryType,
			feeding_method: mapFeedingMethod(profile.feedingMethod),
			return_to_work_date: profile.returnToWorkDate,
			work_setup: profile.workSetup,
		},
		{ onConflict: "id" },
	);

	if (error) {
		console.warn("[Supabase] saveUserProfile failed:", error.message);
		return false;
	}
	return true;
}
