import { PatientTable } from "@/components/patient-table";
import { RealtimePatientPanel } from "@/components/realtime-patient-panel";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { computeStats, getPatientPanel } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function PatientPanel() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	const patients = await getPatientPanel();
	const stats = computeStats(patients);

	const today = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="flex h-screen bg-background">
			<RealtimePatientPanel patientIds={patients.map((p) => p.id)} />
			<Sidebar clinicianEmail={user?.email} clinicName={user?.user_metadata?.clinic_name} />
			<main className="flex-1 overflow-auto px-8 py-8">
				<div className="mb-1 flex items-start justify-between">
					<div>
						<h1 className="font-display text-3xl text-text">Your patients</h1>
						<p className="text-sm text-text-muted">{today}</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center rounded-xl border border-border bg-surface px-4 py-2">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								className="mr-2 text-text-muted"
								aria-label="Search"
								role="img"
							>
								<circle
									cx="7"
									cy="7"
									r="5.5"
									stroke="currentColor"
									strokeWidth="1.5"
								/>
								<path
									d="M11 11L14 14"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
							</svg>
							<span className="text-sm text-text-muted">
								Search patients...
							</span>
						</div>
					</div>
				</div>

				<div className="mt-6 flex gap-4">
					<StatCard
						label="Total Patients"
						value={String(stats.totalPatients)}
						subtitle={
							stats.totalPatients > 0
								? `${stats.totalPatients} linked`
								: "None yet"
						}
						subtitleColor="text-text-muted"
					/>
					<StatCard
						label="Active Flags"
						value={String(stats.activeFlags)}
						subtitle={
							stats.highSeverityFlags > 0
								? `${stats.highSeverityFlags} high severity`
								: "None"
						}
						subtitleColor={
							stats.highSeverityFlags > 0 ? "text-danger" : "text-success"
						}
					/>
					<StatCard
						label="Avg Recovery Score"
						value={stats.avgScore > 0 ? String(stats.avgScore) : "—"}
						subtitle={stats.avgScore > 0 ? "panel average" : "No data yet"}
						subtitleColor="text-text-muted"
					/>
				</div>

				<div className="mt-6">
					<PatientTable patients={patients} />
				</div>
			</main>
		</div>
	);
}
