"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { AlertItem, AlertSeverity, AlertStats } from "@/lib/queries";
import { createClient } from "@/lib/supabase/client";

type SeverityFilter = "all" | AlertSeverity | "resolved";

const severityConfig: Record<
	AlertSeverity,
	{ bg: string; text: string; label: string; border: string }
> = {
	urgent: {
		bg: "bg-danger",
		text: "text-white",
		label: "URGENT",
		border: "border-l-danger",
	},
	high: {
		bg: "bg-danger",
		text: "text-white",
		label: "HIGH",
		border: "border-l-danger",
	},
	medium: {
		bg: "bg-warning",
		text: "text-white",
		label: "MED",
		border: "border-l-warning",
	},
	low: {
		bg: "bg-text-muted",
		text: "text-white",
		label: "LOW",
		border: "border-l-text-muted",
	},
};

const typeLabel: Record<string, string> = {
	ppd_risk: "PPD Risk",
	mood_decline: "Mood Decline",
	sleep_decline: "Sleep Decline",
	language_alert: "Language Alert",
	voice_discrepancy: "Voice Discrepancy",
};

function formatTimestamp(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const yesterday = new Date(now.getTime() - 86400000)
		.toISOString()
		.slice(0, 10);
	const dateStr = d.toISOString().slice(0, 10);

	const time = d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

	if (dateStr === today) return `Today, ${time}`;
	if (dateStr === yesterday) return `Yesterday, ${time}`;
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface AlertsClientProps {
	alerts: AlertItem[];
	stats: AlertStats;
}

export function AlertsClient({ alerts, stats }: AlertsClientProps) {
	const router = useRouter();
	const supabase = createClient();
	const [filter, setFilter] = useState<SeverityFilter>("all");
	const [expandedId, setExpandedId] = useState<string>(
		alerts.find((a) => !a.resolvedAt)?.id ?? "",
	);
	const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
	const [, startTransition] = useTransition();

	useEffect(() => {
		const patientIds = [...new Set(alerts.map((a) => a.patientId))];
		if (patientIds.length === 0) return;

		const filter = `user_id=in.(${patientIds.join(",")})`;

		const channel = supabase
			.channel("alerts_flags_changes")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "flags", filter },
				() => {
					startTransition(() => router.refresh());
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, router, alerts]);

	const filteredAlerts =
		filter === "all"
			? alerts.filter((a) => !a.resolvedAt)
			: filter === "resolved"
				? alerts.filter((a) => a.resolvedAt)
				: alerts.filter((a) => a.severity === filter && !a.resolvedAt);

	async function handleResolve(flagId: string) {
		setResolvingIds((prev) => new Set(prev).add(flagId));

		const { data, error } = await supabase.rpc("resolve_flag", {
			p_flag_id: flagId,
		});

		if (error || data === false) {
			console.error("[alerts] resolve_flag failed:", error?.message);
		}

		setResolvingIds((prev) => {
			const next = new Set(prev);
			next.delete(flagId);
			return next;
		});
		startTransition(() => router.refresh());
	}

	const filterButtons: {
		key: SeverityFilter;
		label: string;
		count?: number;
		color?: string;
	}[] = [
		{
			key: "urgent",
			label: "Urgent",
			count: stats.urgent,
			color: "bg-danger text-white",
		},
		{
			key: "high",
			label: "High",
			count: stats.high,
			color: "bg-danger/80 text-white",
		},
		{
			key: "medium",
			label: "Medium",
			count: stats.medium,
			color: "bg-warning text-white",
		},
		{
			key: "low",
			label: "Low",
			count: stats.low,
		},
		{
			key: "resolved",
			label: "Resolved",
			count: stats.resolved,
		},
	];

	return (
		<>
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h1 className="font-display text-3xl text-text">Smart alerts</h1>
					<p className="text-sm text-text-muted">
						{stats.total} active alert{stats.total !== 1 ? "s" : ""} across your
						panel
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

			{filteredAlerts.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16">
					<p className="text-lg font-medium text-text-secondary">
						{filter === "resolved"
							? "No resolved alerts in the last 7 days"
							: filter === "all"
								? "No active alerts"
								: `No ${filter} severity alerts`}
					</p>
					<p className="mt-1 text-sm text-text-muted">
						Alerts appear here when patient flags are detected
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{filteredAlerts.map((alert) => {
						const isExpanded = expandedId === alert.id;
						const isResolved = !!alert.resolvedAt;
						const isResolving = resolvingIds.has(alert.id);
						const config = severityConfig[alert.severity] ?? severityConfig.low;

						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: card contains nested Link/button — cannot use <button> wrapper
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard nav via inner focusable elements
							<div
								key={alert.id}
								onClick={() => setExpandedId(isExpanded ? "" : alert.id)}
								className={`cursor-pointer rounded-2xl border border-border border-l-4 ${config.border} bg-surface p-5 text-left transition-colors hover:bg-surface-raised/60 ${
									isResolved ? "opacity-60" : ""
								}`}
							>
								{isExpanded ? (
									<ExpandedAlert
										alert={alert}
										config={config}
										isResolved={isResolved}
										isResolving={isResolving}
										onResolve={handleResolve}
									/>
								) : (
									<CollapsedAlert
										alert={alert}
										config={config}
										isResolved={isResolved}
									/>
								)}
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}

function ExpandedAlert({
	alert,
	config,
	isResolved,
	isResolving,
	onResolve,
}: {
	alert: AlertItem;
	config: { bg: string; text: string; label: string };
	isResolved: boolean;
	isResolving: boolean;
	onResolve: (id: string) => void;
}) {
	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span
						className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${config.bg} ${config.text}`}
					>
						{config.label} SEVERITY
					</span>
					{isResolved && (
						<span className="rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-success">
							RESOLVED
						</span>
					)}
					<span className="text-sm text-text-muted">
						<Link
							href={`/patients/${alert.patientId}`}
							className="underline decoration-text-muted/30 hover:text-text-secondary"
							onClick={(e) => e.stopPropagation()}
						>
							{alert.patientName}
						</Link>{" "}
						· {formatTimestamp(alert.createdAt)}
						{alert.score > 0 && <> · Score {alert.score}</>}
					</span>
				</div>
				{!isResolved && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							if (!isResolving) onResolve(alert.id);
						}}
						disabled={isResolving}
						className={`rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-opacity ${
							isResolving ? "cursor-wait opacity-50" : "hover:opacity-90"
						}`}
					>
						{isResolving ? "Resolving…" : "Mark Resolved"}
					</button>
				)}
				{isResolved && alert.resolvedAt && (
					<span className="text-xs text-text-muted">
						Resolved {formatTimestamp(alert.resolvedAt)}
					</span>
				)}
			</div>
			<h3 className="mb-1 text-lg font-medium text-text">
				{typeLabel[alert.type] ?? alert.type}
			</h3>
			<p className="mb-4 text-sm text-text-secondary">{alert.reason}</p>
			{(alert.differential || alert.suggestedAction) && (
				<div
					className={`grid gap-4 ${
						alert.differential && alert.suggestedAction
							? "grid-cols-2"
							: "grid-cols-1"
					}`}
				>
					{alert.differential && (
						<div className="rounded-xl border border-border bg-background p-4">
							<p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
								Differential
							</p>
							<p className="text-sm leading-relaxed text-text-secondary">
								{alert.differential}
							</p>
						</div>
					)}
					{alert.suggestedAction && (
						<div className="rounded-xl border border-border bg-background p-4">
							<p className="mb-2 text-xs font-bold tracking-wider text-primary uppercase">
								Suggested Action
							</p>
							<p className="text-sm leading-relaxed text-text-secondary">
								{alert.suggestedAction}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function CollapsedAlert({
	alert,
	config,
	isResolved,
}: {
	alert: AlertItem;
	config: { bg: string; text: string; label: string };
	isResolved: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<span
					className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${config.bg} ${config.text}`}
				>
					{config.label}
				</span>
				{isResolved && (
					<span className="rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-success">
						RESOLVED
					</span>
				)}
				<div>
					<p className="font-medium text-text">
						{typeLabel[alert.type] ?? alert.type} —{" "}
						<Link
							href={`/patients/${alert.patientId}`}
							className="underline decoration-text-muted/30 hover:text-text-secondary"
							onClick={(e) => e.stopPropagation()}
						>
							{alert.patientName}
						</Link>
					</p>
					<p className="text-sm text-text-secondary">
						{alert.reason.length > 100
							? `${alert.reason.slice(0, 100)}…`
							: alert.reason}
					</p>
				</div>
			</div>
			<span className="text-sm text-text-muted">
				{formatTimestamp(alert.createdAt)}
			</span>
		</div>
	);
}
