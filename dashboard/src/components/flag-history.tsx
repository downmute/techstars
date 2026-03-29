interface FlagItem {
	id: string;
	type: string;
	severity: string;
	reason: string;
	differential: string | null;
	suggestedAction: string | null;
	createdAt: string;
}

interface FlagHistoryProps {
	flags: FlagItem[];
}

const severityBorderColor: Record<string, string> = {
	urgent: "border-l-danger",
	high: "border-l-danger",
	medium: "border-l-warning",
	low: "border-l-success",
};

const typeLabel: Record<string, string> = {
	ppd_risk: "PPD Risk",
	mood_decline: "Mood Decline",
	sleep_decline: "Sleep Decline",
	language_alert: "Language Alert",
	voice_discrepancy: "Voice Discrepancy",
};

function formatFlagDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export function FlagHistory({ flags }: FlagHistoryProps) {
	return (
		<div className="rounded-2xl border border-border bg-surface p-6">
			<h2 className="mb-4 font-display text-xl text-text">Flag history</h2>
			{flags.length === 0 ? (
				<p className="py-4 text-center text-sm text-text-muted">
					No active flags
				</p>
			) : (
				<div className="flex flex-col gap-3">
					{flags.map((flag) => {
						const borderColor =
							severityBorderColor[flag.severity] ?? "border-l-warning";

						return (
							<div
								key={flag.id}
								className={`rounded-xl border border-border border-l-4 ${borderColor} bg-background p-4`}
							>
								<div className="flex items-start justify-between">
									<div>
										<p className="font-medium text-text">
											{typeLabel[flag.type] ?? flag.type}
										</p>
										<p className="mt-0.5 text-sm text-text-secondary">
											{flag.reason}
										</p>
										<p className="mt-1 text-xs text-text-muted">
											{formatFlagDate(flag.createdAt)}
										</p>
									</div>
									<span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
										Active
									</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
