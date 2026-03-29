import Link from "next/link";
import { patients } from "@/lib/mock-data";
import { ScoreBadge } from "./score-badge";
import { Sparkline } from "./sparkline";
import { StatusDot } from "./status-dot";

const statusLabel: Record<string, string> = {
  "on-track": "On track",
  watch: "Watch",
  flagged: "Flagged",
};

export function PatientTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-6 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Patient
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Weeks PP
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Score
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              7-Day Trend
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Last Check-in
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-widest text-text-muted uppercase">
              Flags
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="group border-b border-border last:border-b-0 transition-colors hover:bg-surface-raised/50"
            >
              <td className="relative px-6 py-4">
                <div
                  className={`absolute top-2 bottom-2 left-0 w-1 rounded-r ${
                    patient.status === "on-track"
                      ? "bg-success"
                      : patient.status === "watch"
                        ? "bg-warning"
                        : "bg-danger"
                  }`}
                />
                <Link
                  href={`/patients/${patient.id}`}
                  className="font-medium text-text hover:text-primary transition-colors"
                >
                  {patient.name}
                </Link>
              </td>
              <td className="px-4 py-4 text-sm text-text-secondary">
                {patient.weeksPP} wks
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <ScoreBadge score={patient.score} status={patient.status} />
                  <span
                    className={`text-sm font-medium ${
                      patient.scoreDelta >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {patient.scoreDelta >= 0 ? "+" : ""}
                    {patient.scoreDelta}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4">
                <Sparkline data={patient.trend} status={patient.status} />
              </td>
              <td className="px-4 py-4 text-sm text-text-secondary">
                {patient.lastCheckIn}
              </td>
              <td className="px-4 py-4">
                <StatusDot status={patient.status} label={statusLabel[patient.status]} />
              </td>
              <td className="px-4 py-4 text-center text-sm text-text-secondary">
                {patient.flags > 0 ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-danger/10 text-xs font-semibold text-danger">
                    {patient.flags}
                  </span>
                ) : (
                  patient.flags
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
