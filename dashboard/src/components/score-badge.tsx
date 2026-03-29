import type { PatientStatus } from "@/lib/mock-data";

const bgColors: Record<PatientStatus, string> = {
  "on-track": "bg-success",
  watch: "bg-warning",
  flagged: "bg-danger",
};

interface ScoreBadgeProps {
  score: number;
  status: PatientStatus;
}

export function ScoreBadge({ score, status }: ScoreBadgeProps) {
  return (
    <span
      className={`inline-flex h-8 w-10 items-center justify-center rounded-md text-sm font-semibold text-white ${bgColors[status]}`}
    >
      {score}
    </span>
  );
}
