"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimePatientPanel({ patientIds }: { patientIds: string[] }) {
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		if (patientIds.length === 0) return;

		const filter = `user_id=in.(${patientIds.join(",")})`;

		const channel = supabase
			.channel("clinic_changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "recovery_scores",
					filter,
				},
				() => router.refresh(),
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "flags",
					filter,
				},
				() => router.refresh(),
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, router, patientIds]);

	return null;
}
