import Link from "next/link";
import { redirect } from "next/navigation";
import { FlagHistory } from "@/components/flag-history";
import { Sidebar } from "@/components/sidebar";
import { TrendChart } from "@/components/trend-chart";
import {
	getPatientClinicalSummaries,
	getPatientDetail,
	getPatientPanel,
} from "@/lib/queries";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
	const { id } = await params;

	const panel = await getPatientPanel();
	const displayIndex = panel.findIndex((p) => p.id === id) + 1;
	if (displayIndex === 0) redirect("/");

	const [patient, clinicalSummaries] = await Promise.all([
		getPatientDetail(id, displayIndex),
		getPatientClinicalSummaries(id, 7),
	]);
	if (!patient) redirect("/");

	const statusLabel =
		patient.status === "on-track"
			? "On track"
			: patient.status === "watch"
				? "Watch"
				: "Needs follow-up";

	const statusColor =
		patient.status === "on-track"
			? "text-success"
			: patient.status === "watch"
				? "text-warning"
				: "text-danger";

	const statusDot =
		patient.status === "on-track"
			? "bg-success"
			: patient.status === "watch"
				? "bg-warning"
				: "bg-danger";

	const scoreRingColor =
		patient.score >= 70
			? "#5A8A6A"
			: patient.score >= 50
				? "#C4925A"
				: "#B5404A";

	const circumference = 2 * Math.PI * 42;
	const offset = circumference - (patient.score / 100) * circumference;

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto px-8 py-8">
				<div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
					<Link href="/" className="text-primary hover:underline">
						Patients
					</Link>
					<span>/</span>
					<span className="text-text">{patient.name}</span>
				</div>

				<div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-surface px-8 py-6">
					<div className="flex items-center gap-5">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
							<span className="font-display text-xl text-primary">
								P{displayIndex}
							</span>
						</div>
						<div>
							<h1 className="text-xl font-semibold text-text">
								{patient.name}
							</h1>
							<p className="text-sm text-text-secondary">
								{patient.weeksPP} weeks postpartum
							</p>
							<div className="mt-2 flex gap-8">
								<div>
									<p className="text-xs font-medium tracking-wider text-text-muted uppercase">
										Delivery
									</p>
									<p className="text-sm font-medium text-text">
										{patient.deliveryType}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium tracking-wider text-text-muted uppercase">
										Feeding
									</p>
									<p className="text-sm font-medium text-text">
										{patient.feedingMethod}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium tracking-wider text-text-muted uppercase">
										Return to Work
									</p>
									<p className="text-sm font-medium text-text">
										{patient.returnToWork}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium tracking-wider text-text-muted uppercase">
										Last Check-in
									</p>
									<p className="text-sm font-medium text-text">
										{patient.lastCheckIn}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-1.5">
							<span className={`h-2 w-2 rounded-full ${statusDot}`} />
							<span className={`text-sm font-medium ${statusColor}`}>
								{statusLabel}
							</span>
						</div>
						<div className="relative flex flex-col items-center">
							<svg
								width="96"
								height="96"
								viewBox="0 0 96 96"
								aria-label="Recovery score"
								role="img"
							>
								<circle
									cx="48"
									cy="48"
									r="42"
									fill="none"
									stroke="#E8DDD4"
									strokeWidth="6"
								/>
								<circle
									cx="48"
									cy="48"
									r="42"
									fill="none"
									stroke={scoreRingColor}
									strokeWidth="6"
									strokeLinecap="round"
									strokeDasharray={circumference}
									strokeDashoffset={offset}
									transform="rotate(-90 48 48)"
								/>
								<text
									x="48"
									y="44"
									textAnchor="middle"
									dominantBaseline="middle"
									className="font-display text-2xl"
									fill="#2C1F1A"
								>
									{patient.score}
								</text>
							</svg>
							<span className="mt-1 text-xs font-medium text-text-muted">
								Recovery
							</span>
						</div>
					</div>
				</div>

				<div className="mb-6 grid grid-cols-3 gap-4">
					{[
						{ label: "Physical", data: patient.physical },
						{ label: "Mental", data: patient.mental },
						{ label: "Sleep", data: patient.sleep },
					].map((sub) => {
						const barColor =
							sub.data.score >= 70
								? "bg-success"
								: sub.data.score >= 50
									? "bg-warning"
									: "bg-danger";
						const deltaColor =
							sub.data.delta >= 0 ? "text-success" : "text-danger";
						return (
							<div
								key={sub.label}
								className="rounded-2xl border border-border bg-surface p-5"
							>
								<div className="flex items-center justify-between">
									<p className="text-xs font-medium tracking-wider text-text-secondary uppercase">
										{sub.label}
									</p>
									<p className="text-xs text-text-muted">
										Weight: {sub.data.weight}%
									</p>
								</div>
								<div className="mt-2 flex items-baseline gap-2">
									<span className="font-display text-3xl text-text">
										{sub.data.score}
									</span>
									<span className={`text-sm font-medium ${deltaColor}`}>
										{sub.data.delta >= 0 ? "+" : ""}
										{sub.data.delta} this week
									</span>
								</div>
								<div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
									<div
										className={`h-full rounded-full ${barColor}`}
										style={{ width: `${sub.data.score}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div className="col-span-2 rounded-2xl border border-border bg-surface p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-display text-xl text-text">30-day trend</h2>
							<div className="flex items-center gap-4 text-xs text-text-muted">
								<span className="flex items-center gap-1.5">
									<span className="h-0.5 w-4 rounded bg-primary" />
									Overall
								</span>
								<span className="flex items-center gap-1.5">
									<span className="h-0.5 w-4 rounded bg-accent" />
									Physical
								</span>
								<span className="flex items-center gap-1.5">
									<span className="h-0.5 w-4 rounded bg-danger" />
									Mental
								</span>
								<span className="flex items-center gap-1.5">
									<span className="h-0.5 w-4 rounded bg-text-muted" />
									Sleep
								</span>
							</div>
						</div>
						<TrendChart score={patient.score} status={patient.status} />
					</div>

					<FlagHistory flags={patient.flagList} />
				</div>

				{clinicalSummaries.length > 0 && (
					<div className="mt-6 rounded-2xl border border-border bg-sidebar p-6 text-sidebar-text">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-display text-xl">Clinical notes</h2>
							<span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase">
								AI-Generated
							</span>
						</div>
						<div className="flex flex-col gap-4">
							{clinicalSummaries.map((entry) => (
								<div
									key={entry.date}
									className="rounded-xl border border-white/10 bg-white/5 p-4"
								>
									<p className="mb-1.5 text-xs font-medium tracking-wider text-sidebar-text/60 uppercase">
										{new Date(`${entry.date}T00:00:00`).toLocaleDateString(
											"en-US",
											{
												weekday: "short",
												month: "short",
												day: "numeric",
											},
										)}
									</p>
									<p className="text-sm leading-relaxed text-sidebar-text/85">
										{entry.clinicalSummary}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
