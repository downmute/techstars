"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function RealtimePatientPanel() {
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		const channel = supabase
			.channel("recovery_scores_changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "recovery_scores",
				},
				() => {
					router.refresh();
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "flags",
				},
				() => {
					router.refresh();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, router]);

	return null;
}
