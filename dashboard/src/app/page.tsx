import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { PatientTable } from "@/components/patient-table";

export default function PatientPanel() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto px-8 py-8">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-text">Your patients</h1>
            <p className="text-sm text-text-muted">Monday, March 29, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-border bg-surface px-4 py-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2 text-text-muted">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-text-muted">Search patients...</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5V4M8 12V14.5" stroke="#E8DDD4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 8C13.5 4.96 11.04 2.5 8 2.5S2.5 4.96 2.5 8" stroke="#E8DDD4" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="5" r="1" fill="#B5604F" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <StatCard label="Total Patients" value="24" subtitle="+3 this week" subtitleColor="text-success" />
          <StatCard label="Active Flags" value="5" subtitle="2 high severity" subtitleColor="text-danger" />
          <StatCard label="Avg Recovery Score" value="71" subtitle="+2.4 vs last week" subtitleColor="text-success" />
        </div>

        <div className="mt-6">
          <PatientTable />
        </div>
      </main>
    </div>
  );
}
