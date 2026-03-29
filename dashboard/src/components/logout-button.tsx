"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
	const router = useRouter();
	const supabase = createClient();

	async function handleLogout() {
		await supabase.auth.signOut();
		router.push("/login");
		router.refresh();
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			className="mt-2 text-xs text-text-muted transition-colors hover:text-text"
		>
			Sign out
		</button>
	);
}
