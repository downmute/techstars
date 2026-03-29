import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { dailyCheckIns, clinicalNotes } from "@/lib/mock-data";

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

export default function DailySummaryPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl text-text">Daily summary</h1>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-1.5">
              <button type="button" className="text-text-muted hover:text-text">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L5 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="text-sm font-medium text-text">Monday, March 29</span>
              <button type="button" className="text-text-muted hover:text-text">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2L9 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <button type="button" className="rounded-xl border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-raised">
            Today
          </button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard label="Check-ins Today" value="18 / 24" subtitle="" />
          <StatCard label="Flagged Today" value="3" subtitle="" subtitleColor="text-danger" />
          <StatCard label="Avg Panel Score" value="71" subtitle="+1.2" subtitleColor="text-success" />
          <StatCard label="Missed Check-ins" value="6" subtitle="" subtitleColor="text-warning" />
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-text">Patient check-ins</h2>
              <button type="button" className="text-sm text-primary hover:underline">
                View all 18
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {dailyCheckIns.map((checkIn) => (
                <div
                  key={checkIn.patientName}
                  className="flex items-start gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <div
                    className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusDot[checkIn.status]}`}
                    style={{ marginTop: "8px" }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-[100px] flex-shrink-0">
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
                    {checkIn.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-border bg-sidebar p-6 text-sidebar-text">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Clinical notes</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase">
                AI-Generated
              </span>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-danger uppercase">
                  Priority Patients
                </p>
                <p className="text-sm leading-relaxed text-sidebar-text/80">
                  {clinicalNotes.priorityPatients}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-warning uppercase">
                  Co-Decline Alert
                </p>
                <p className="text-sm leading-relaxed text-sidebar-text/80">
                  {clinicalNotes.coDeclineAlert}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-text-muted uppercase">
                  Panel Trend
                </p>
                <p className="text-sm leading-relaxed text-sidebar-text/80">
                  {clinicalNotes.panelTrend}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
