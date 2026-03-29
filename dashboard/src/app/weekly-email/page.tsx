import Link from "next/link";
import { getWeeklySummary } from "@/lib/queries";

function isValidDate(str: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(str) && !Number.isNaN(Date.parse(str));
}

function getWeekRange(dateStr?: string): { start: string; end: string } {
	const ref =
		dateStr && isValidDate(dateStr)
			? new Date(`${dateStr}T00:00:00`)
			: new Date();
	const day = ref.getDay();
	const mondayOffset = day === 0 ? -6 : 1 - day;
	const monday = new Date(ref);
	monday.setDate(ref.getDate() + mondayOffset);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	return {
		start: monday.toISOString().slice(0, 10),
		end: sunday.toISOString().slice(0, 10),
	};
}

function formatWeekLabel(start: string, end: string): string {
	const s = new Date(`${start}T00:00:00`);
	const e = new Date(`${end}T00:00:00`);
	const sMonth = s.toLocaleDateString("en-US", { month: "long" });
	const eMonth = e.toLocaleDateString("en-US", { month: "long" });
	const year = e.getFullYear();
	if (sMonth === eMonth) {
		return `Week of ${sMonth} ${s.getDate()} – ${e.getDate()}, ${year}`;
	}
	return `Week of ${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${year}`;
}

const barColors = ["bg-success", "bg-primary", "bg-warning", "bg-danger"];

const severityBorder: Record<string, string> = {
	urgent: "border-l-danger",
	high: "border-l-danger",
	medium: "border-l-warning",
	low: "border-l-text-muted",
};

interface PageProps {
	searchParams: Promise<{ date?: string }>;
}

export default async function WeeklyEmailPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const { start, end } = getWeekRange(params.date);
	const { patients, stats } = await getWeeklySummary(start, end);

	const flaggedPatients = patients
		.filter((p) => p.hasCheckIns && (p.flagCount > 0 || p.latestScore < 50))
		.sort((a, b) => a.latestScore - b.latestScore);

	const maxDist = Math.max(...stats.scoreDistribution.map((d) => d.count), 1);

	const prevWeekDate = new Date(`${start}T00:00:00`);
	prevWeekDate.setDate(prevWeekDate.getDate() - 7);
	const prevDate = prevWeekDate.toISOString().slice(0, 10);

	const nextWeekDate = new Date(`${start}T00:00:00`);
	nextWeekDate.setDate(nextWeekDate.getDate() + 7);
	const today = new Date().toISOString().slice(0, 10);
	const showNext = nextWeekDate.toISOString().slice(0, 10) <= today;

	const statCards = [
		{ label: "Patients", value: String(stats.totalPatients) },
		{
			label: "Avg Score",
			value: String(stats.avgScore),
			sub:
				stats.avgScoreDelta !== 0
					? `${stats.avgScoreDelta >= 0 ? "+" : ""}${stats.avgScoreDelta}`
					: undefined,
			subColor: stats.avgScoreDelta >= 0 ? "text-success" : "text-danger",
		},
		{ label: "Flags", value: String(stats.totalFlags) },
		{ label: "Check-in Rate", value: `${stats.checkInRate}%` },
	];

	return (
		<div className="flex min-h-screen items-center justify-center bg-surface-raised p-10">
			<div className="w-[600px] overflow-hidden rounded-2xl bg-white shadow-lg">
				<div className="flex items-center justify-between bg-sidebar px-8 py-5">
					<span className="font-display text-xl text-sidebar-text italic">
						ReEntry
					</span>
					<span className="text-sm text-sidebar-text/70">
						Weekly Clinic Summary
					</span>
				</div>

				<div className="px-8 py-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="font-display text-2xl text-text">
								{formatWeekLabel(start, end)}
							</h1>
							<p className="mt-1 text-sm text-text-secondary">
								Clinic Weekly Summary
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Link
								href={`/weekly-email?date=${prevDate}`}
								className="rounded-lg border border-border px-2 py-1 text-text-muted hover:bg-surface"
								aria-label="Previous week"
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
							{showNext && (
								<Link
									href={`/weekly-email?date=${nextWeekDate.toISOString().slice(0, 10)}`}
									className="rounded-lg border border-border px-2 py-1 text-text-muted hover:bg-surface"
									aria-label="Next week"
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
							)}
						</div>
					</div>

					<div className="mt-6 grid grid-cols-4 gap-3">
						{statCards.map((stat) => (
							<div
								key={stat.label}
								className="rounded-xl border border-border p-4"
							>
								<p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
									{stat.label}
								</p>
								<div className="flex items-baseline gap-1">
									<span className="font-display text-2xl text-text">
										{stat.value}
									</span>
									{stat.sub && (
										<span className={`text-xs font-medium ${stat.subColor}`}>
											{stat.sub}
										</span>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="mt-8">
						<h2 className="mb-3 text-xs font-bold tracking-wider text-danger uppercase">
							Patients Needing Attention
						</h2>
						{flaggedPatients.length === 0 ? (
							<p className="py-4 text-sm text-text-muted">
								No flagged patients this week.
							</p>
						) : (
							<div className="flex flex-col gap-2.5">
								{flaggedPatients.map((p) => {
									const severity = p.latestFlagSeverity ?? "medium";
									const border =
										severityBorder[severity] ?? "border-l-text-muted";
									return (
										<div
											key={p.patientId}
											className={`rounded-xl border border-border border-l-4 ${border} p-4`}
										>
											<div className="flex items-center gap-3">
												<span className="font-medium text-text">
													{p.patientName}
												</span>
												<span className="text-sm font-semibold text-danger">
													{p.latestScore}
												</span>
												{p.scoreDelta !== 0 && (
													<span className="text-sm text-danger">
														({p.scoreDelta >= 0 ? "+" : ""}
														{p.scoreDelta})
													</span>
												)}
												<span className="flex-1 text-sm text-text-secondary">
													{p.latestFlagReason ??
														p.latestClinicalSummary ??
														`${p.flagCount} flag${p.flagCount !== 1 ? "s" : ""} this week`}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="mt-8">
						<h2 className="mb-4 text-xs font-bold tracking-wider text-text-muted uppercase">
							Panel Score Distribution
						</h2>
						<div className="flex flex-col gap-2.5">
							{stats.scoreDistribution.map((bar, i) => (
								<div key={bar.range} className="flex items-center gap-3">
									<span className="w-12 text-right text-sm text-text-secondary">
										{bar.range}
									</span>
									<div className="relative h-6 flex-1 overflow-hidden rounded bg-surface">
										<div
											className={`h-full rounded ${barColors[i]}`}
											style={{
												width: `${Math.max((bar.count / maxDist) * 100, bar.count > 0 ? 8 : 0)}%`,
											}}
										/>
									</div>
									<span className="w-6 text-right text-sm font-semibold text-primary">
										{bar.count}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="mt-8 flex flex-col items-center gap-2">
						<Link
							href="/"
							className="inline-block rounded-full bg-primary px-8 py-3 text-center text-sm font-semibold text-white"
						>
							View Full Dashboard
						</Link>
						<p className="text-xs text-text-muted">
							Log in to see detailed patient data and trends
						</p>
					</div>
				</div>

				<div className="border-t border-border px-8 py-5 text-center">
					<p className="font-display text-sm text-primary italic">ReEntry</p>
					<p className="mt-1 text-xs text-text-muted">
						Weekly Summary · Sent every Monday at 7:00 AM
					</p>
					<p className="mt-1 text-xs text-text-muted">
						<span className="underline cursor-pointer">Unsubscribe</span>
						{" · "}
						<span className="underline cursor-pointer">
							Notification Preferences
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
