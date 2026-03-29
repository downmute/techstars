import { Sidebar } from "@/components/sidebar";
import { getAlertsPanel } from "@/lib/queries";
import { AlertsClient } from "./alerts-client";

export default async function AlertsPage() {
	const { alerts, stats } = await getAlertsPanel(true);

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto px-8 py-8">
				<AlertsClient alerts={alerts} stats={stats} />
			</main>
		</div>
	);
}
