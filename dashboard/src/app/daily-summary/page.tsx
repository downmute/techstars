import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { getDailySummaryPanel } from "@/lib/queries";

const statusDot: Record<string, string> = {
	"on-track": "bg-success",
	watch: "bg-warning",
	flagged: "bg-danger",
};

const scoreBg: Record<string, string> = {
	"on-track": "bg-success",
	watch: "bg-warning",
	flagged: "bg-danger",
};

function formatDisplayDate(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00`);
	return d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

function isValidDate(str: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(str) && !Number.isNaN(Date.parse(str));
}

function shiftDate(dateStr: string, days: number): string {
	const d = new Date(`${dateStr}T00:00:00`);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

interface PageProps {
	searchParams: Promise<{ date?: string }>;
}

export default async function DailySummaryPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const today = new Date().toISOString().slice(0, 10);
	const rawDate = params.date;
	const date = rawDate && isValidDate(rawDate) ? rawDate : today;
	const isToday = date === today;

	const { checkIns, stats } = await getDailySummaryPanel(date);

	const prevDate = shiftDate(date, -1);
	const nextDate = shiftDate(date, 1);
	const showNext = nextDate <= today;

	const flaggedCheckIns = checkIns.filter((c) => c.status === "flagged");
	const clinicalNotes = checkIns
		.filter((c) => c.clinicalSummary)
		.sort((a, b) => a.score - b.score);

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto px-8 py-8">
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="font-display text-3xl text-text">Daily summary</h1>
						<div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-1.5">
							<Link
								href={`/daily-summary?date=${prevDate}`}
								className="text-text-muted hover:text-text"
								aria-label="Previous day"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 14 14"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M9 2L5 7L9 12"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</Link>
							<span className="text-sm font-medium text-text">
								{formatDisplayDate(date)}
							</span>
							{showNext ? (
								<Link
									href={`/daily-summary?date=${nextDate}`}
									className="text-text-muted hover:text-text"
									aria-label="Next day"
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 14 14"
										fill="none"
										aria-hidden="true"
									>
										<path
											d="M5 2L9 7L5 12"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</Link>
							) : (
								<span className="text-text-muted/30" aria-hidden="true">
									<svg
										width="14"
										height="14"
										viewBox="0 0 14 14"
										fill="none"
										aria-hidden="true"
									>
										<path
											d="M5 2L9 7L5 12"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							)}
						</div>
					</div>
					{!isToday && (
						<Link
							href="/daily-summary"
							className="rounded-xl border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-raised"
						>
							Today
						</Link>
					)}
				</div>

				<div className="mb-6 grid grid-cols-4 gap-4">
					<StatCard
						label="Check-ins Today"
						value={`${stats.checkInsToday} / ${stats.totalPatients}`}
						subtitle=""
					/>
					<StatCard
						label="Flagged Today"
						value={String(stats.flaggedToday)}
						subtitle=""
						subtitleColor={stats.flaggedToday > 0 ? "text-danger" : undefined}
					/>
					<StatCard
						label="Avg Panel Score"
						value={String(stats.avgScore)}
						subtitle={
							stats.avgScoreDelta !== 0
								? `${stats.avgScoreDelta >= 0 ? "+" : ""}${stats.avgScoreDelta}`
								: ""
						}
						subtitleColor={
							stats.avgScoreDelta >= 0 ? "text-success" : "text-danger"
						}
					/>
					<StatCard
						label="Missed Check-ins"
						value={String(stats.missedCheckIns)}
						subtitle=""
						subtitleColor={
							stats.missedCheckIns > 0 ? "text-warning" : undefined
						}
					/>
				</div>

				<div className="grid grid-cols-5 gap-4">
					<div className="col-span-3 rounded-2xl border border-border bg-surface p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-display text-xl text-text">
								Patient check-ins
							</h2>
							{checkIns.length > 0 && (
								<span className="text-sm text-text-muted">
									{checkIns.length} check-in
									{checkIns.length !== 1 ? "s" : ""}
								</span>
							)}
						</div>
						{checkIns.length === 0 ? (
							<p className="py-8 text-center text-sm text-text-muted">
								No check-ins recorded for this date.
							</p>
						) : (
							<div className="flex flex-col gap-3">
								{checkIns.map((checkIn) => (
									<Link
										key={checkIn.patientId}
										href={`/patients/${checkIn.patientId}`}
										className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-surface-raised/40"
									>
										<div
											className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[checkIn.status]}`}
											style={{ marginTop: "8px" }}
										/>
										<div className="flex items-center gap-3">
											<div className="w-[100px] shrink-0">
												<p className="font-medium text-text">
													{checkIn.patientName}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span
													className={`inline-flex h-7 w-9 items-center justify-center rounded text-sm font-semibold text-white ${scoreBg[checkIn.status]}`}
												>
													{checkIn.score}
												</span>
												<span
													className={`text-sm font-medium ${
														checkIn.scoreDelta >= 0
															? "text-success"
															: "text-danger"
													}`}
												>
													{checkIn.scoreDelta >= 0 ? "+" : ""}
													{checkIn.scoreDelta}
												</span>
											</div>
										</div>
										<p className="flex-1 text-sm leading-relaxed text-text-secondary">
											{checkIn.clinicalSummary ??
												`Score: ${checkIn.score}/100${checkIn.flags > 0 ? ` · ${checkIn.flags} active flag${checkIn.flags !== 1 ? "s" : ""}` : ""}`}
										</p>
									</Link>
								))}
							</div>
						)}
					</div>

					<div className="col-span-2 rounded-2xl border border-border bg-sidebar p-6 text-sidebar-text">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-display text-xl">Clinical notes</h2>
							<span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase">
								AI-Generated
							</span>
						</div>

						{clinicalNotes.length === 0 && flaggedCheckIns.length === 0 ? (
							<p className="py-6 text-center text-sm text-sidebar-text/60">
								No clinical summaries available for this date.
							</p>
						) : (
							<div className="flex flex-col gap-5">
								{flaggedCheckIns.length > 0 && (
									<div>
										<p className="mb-2 text-xs font-bold tracking-wider text-danger uppercase">
											Priority Patients
										</p>
										<p className="text-sm leading-relaxed text-sidebar-text/80">
											{flaggedCheckIns
												.map(
													(c) =>
														`${c.patientName} (score ${c.score}, ${c.flags} flag${c.flags !== 1 ? "s" : ""})`,
												)
												.join(". ")}
											. Immediate review recommended.
										</p>
									</div>
								)}

								{clinicalNotes.slice(0, 3).map((note) => (
									<div key={note.patientId}>
										<p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
											{note.patientName}
										</p>
										<p className="text-sm leading-relaxed text-sidebar-text/80">
											{note.clinicalSummary}
										</p>
									</div>
								))}

								<div>
									<p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
										Panel Trend
									</p>
									<p className="text-sm leading-relaxed text-sidebar-text/80">
										{stats.checkInsToday} of {stats.totalPatients} patients
										checked in. Panel average{" "}
										{stats.avgScore > 0
											? `at ${stats.avgScore}`
											: "unavailable"}
										{stats.avgScoreDelta !== 0
											? ` (${stats.avgScoreDelta >= 0 ? "+" : ""}${stats.avgScoreDelta})`
											: ""}
										.{" "}
										{stats.missedCheckIns > 0
											? `${stats.missedCheckIns} patient${stats.missedCheckIns !== 1 ? "s" : ""} did not check in.`
											: "All patients checked in."}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
