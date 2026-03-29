import { Sidebar } from "@/components/sidebar";
import { getAlertsPanel } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { AlertsClient } from "./alerts-client";

export default async function AlertsPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	const { alerts, stats } = await getAlertsPanel(true);

	return (
		<div className="flex h-screen bg-background">
			<Sidebar clinicianEmail={user?.email} clinicName={user?.user_metadata?.clinic_name} />
			<main className="flex-1 overflow-auto px-8 py-8">
				<AlertsClient alerts={alerts} stats={stats} />
			</main>
		</div>
	);
}
