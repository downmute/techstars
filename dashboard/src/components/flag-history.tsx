import { alerts } from "@/lib/mock-data";

interface FlagHistoryProps {
  patientId: string;
}

const flagData = [
  {
    title: "PPD Risk",
    description: "Mood ≤ 2/5 for 4 consecutive days",
    date: "Today, 7:15 AM",
    status: "Active" as const,
    severity: "danger",
  },
  {
    title: "Sleep Decline",
    description: "Sleep + mood declining 5+ days",
    date: "Mar 26",
    status: "Active" as const,
    severity: "warning",
  },
  {
    title: "Anxiety Spike",
    description: "Anxiety 8/10 for 2 days",
    date: "Mar 18",
    status: "Resolved" as const,
    severity: "success",
  },
];

export function FlagHistory({ patientId }: FlagHistoryProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 font-display text-xl text-text">Flag history</h2>
      <div className="flex flex-col gap-3">
        {flagData.map((flag) => {
          const borderColor =
            flag.severity === "danger"
              ? "border-l-danger"
              : flag.severity === "warning"
                ? "border-l-warning"
                : "border-l-success";

          const badgeBg =
            flag.status === "Active"
              ? "bg-danger/10 text-danger"
              : "bg-success/10 text-success";

          return (
            <div
              key={flag.title}
              className={`rounded-xl border border-border border-l-4 ${borderColor} bg-background p-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-text">{flag.title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {flag.description}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{flag.date}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeBg}`}
                >
                  {flag.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
