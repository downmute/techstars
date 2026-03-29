"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { alerts } from "@/lib/mock-data";

type SeverityFilter = "all" | "high" | "medium" | "low" | "resolved";

const severityBadge: Record<
	string,
	{ bg: string; text: string; label: string }
> = {
	high: { bg: "bg-danger", text: "text-white", label: "HIGH" },
	medium: { bg: "bg-warning", text: "text-white", label: "MED" },
	low: { bg: "bg-text-muted", text: "text-white", label: "LOW" },
};

const severityBorder: Record<string, string> = {
	high: "border-l-danger",
	medium: "border-l-warning",
	low: "border-l-text-muted",
};

export default function AlertsPage() {
	const [filter, setFilter] = useState<SeverityFilter>("all");
	const [expandedId, setExpandedId] = useState<string>("a1");

	const filteredAlerts =
		filter === "all"
			? alerts
			: filter === "resolved"
				? alerts.filter((a) => a.resolved)
				: alerts.filter((a) => a.severity === filter && !a.resolved);

	const filterButtons: {
		key: SeverityFilter;
		label: string;
		count?: number;
		color?: string;
	}[] = [
		{
			key: "high",
			label: "High",
			count: alerts.filter((a) => a.severity === "high").length,
			color: "bg-danger text-white",
		},
		{
			key: "medium",
			label: "Medium",
			count: alerts.filter((a) => a.severity === "medium").length,
			color: "bg-warning text-white",
		},
		{
			key: "low",
			label: "Low",
			count: alerts.filter((a) => a.severity === "low").length,
		},
		{ key: "resolved", label: "Resolved" },
	];

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto px-8 py-8">
				<div className="mb-6 flex items-start justify-between">
					<div>
						<h1 className="font-display text-3xl text-text">Smart alerts</h1>
						<p className="text-sm text-text-muted">
							{alerts.length} active alerts across your panel
						</p>
					</div>
					<div className="flex items-center gap-2">
						{filterButtons.map((btn) => {
							const isActive = filter === btn.key;
							return (
								<button
									key={btn.key}
									type="button"
									onClick={() => setFilter(isActive ? "all" : btn.key)}
									className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
										isActive
											? (btn.color ?? "bg-surface-raised text-text")
											: "border border-border bg-surface text-text-secondary hover:bg-surface-raised"
									}`}
								>
									{btn.label}
									{btn.count !== undefined ? ` (${btn.count})` : ""}
								</button>
							);
						})}
					</div>
				</div>

				<div className="flex flex-col gap-3">
					{filteredAlerts.map((alert) => {
						const isExpanded = expandedId === alert.id;
						const badge = severityBadge[alert.severity];
						const border = severityBorder[alert.severity];

						return (
							<div key={alert.id}>
								<button
									type="button"
									onClick={() => setExpandedId(isExpanded ? "" : alert.id)}
									className={`w-full rounded-2xl border border-border border-l-4 ${border} bg-surface p-5 text-left transition-colors hover:bg-surface-raised/60`}
								>
									{isExpanded && alert.whyFlagged ? (
										<div>
											<div className="mb-4 flex items-center justify-between">
												<div className="flex items-center gap-3">
													<span
														className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${badge.bg} ${badge.text}`}
													>
														HIGH SEVERITY
													</span>
													<span className="text-sm text-text-muted">
														{alert.patientName} · {alert.timestamp}
													</span>
												</div>
												<span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">
													Mark Resolved
												</span>
											</div>
											<h3 className="mb-4 text-lg font-medium text-text">
												{alert.title}
											</h3>
											<div className="grid grid-cols-3 gap-4">
												<div className="rounded-xl border border-border bg-background p-4">
													<p className="mb-2 text-xs font-bold tracking-wider text-danger uppercase">
														Why Flagged
													</p>
													<p className="text-sm leading-relaxed text-text-secondary">
														{alert.whyFlagged}
													</p>
												</div>
												<div className="rounded-xl border border-border bg-background p-4">
													<p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
														Differential
													</p>
													<p className="text-sm leading-relaxed text-text-secondary">
														{alert.differential}
													</p>
												</div>
												<div className="rounded-xl border border-border bg-background p-4">
													<p className="mb-2 text-xs font-bold tracking-wider text-primary uppercase">
														Suggested Action
													</p>
													<p className="text-sm leading-relaxed text-text-secondary">
														{alert.suggestedAction}
													</p>
												</div>
											</div>
										</div>
									) : (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<span
													className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${badge.bg} ${badge.text}`}
												>
													{badge.label}
												</span>
												<div>
													<p className="font-medium text-text">{alert.title}</p>
													<p className="text-sm text-text-secondary">
														{alert.description}
													</p>
												</div>
											</div>
											<span className="text-sm text-text-muted">
												{alert.timestamp}
											</span>
										</div>
									)}
								</button>
							</div>
						);
					})}
				</div>
			</main>
		</div>
	);
}
