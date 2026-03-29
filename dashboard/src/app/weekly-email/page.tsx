export default function WeeklyEmailPage() {
  const barData = [
    { range: "80–100", count: 8, color: "bg-success", width: "53%" },
    { range: "60–79", count: 11, color: "bg-primary", width: "73%" },
    { range: "40–59", count: 3, color: "bg-warning", width: "20%" },
    { range: "0–39", count: 2, color: "bg-danger", width: "13%" },
  ];

  const flaggedPatients = [
    {
      name: "Patient 3",
      score: 38,
      delta: -24,
      note: "PPD risk flag. Mood ≤ 2/5 for 4 consecutive days.",
      severity: "danger",
    },
    {
      name: "Patient 9",
      score: 41,
      delta: -18,
      note: "Sleep + mood co-decline. Highest priority escalation.",
      severity: "danger",
    },
    {
      name: "Patient 5",
      score: 56,
      delta: -8,
      note: "Voice discrepancy. Reported mood 4/5, speaking rate 40% below baseline.",
      severity: "warning",
    },
  ];

  const borderColor: Record<string, string> = {
    danger: "border-l-danger",
    warning: "border-l-warning",
  };

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
          <h1 className="font-display text-2xl text-text">
            Week of March 23 – 29, 2026
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Bloom OB/GYN · Dr. Sarah Kim
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: "Patients", value: "24" },
              { label: "Avg Score", value: "71", sub: "+2.4", subColor: "text-success" },
              { label: "Flags", value: "7" },
              { label: "Check-in Rate", value: "82%" },
            ].map((stat) => (
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
            <div className="flex flex-col gap-2.5">
              {flaggedPatients.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-xl border border-border border-l-4 ${borderColor[p.severity]} p-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text">{p.name}</span>
                    <span className="text-sm font-semibold text-danger">
                      {p.score}
                    </span>
                    <span className="text-sm text-danger">({p.delta})</span>
                    <span className="flex-1 text-sm text-text-secondary">
                      {p.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xs font-bold tracking-wider text-text-muted uppercase">
              Panel Score Distribution
            </h2>
            <div className="flex flex-col gap-2.5">
              {barData.map((bar) => (
                <div key={bar.range} className="flex items-center gap-3">
                  <span className="w-12 text-right text-sm text-text-secondary">
                    {bar.range}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-surface">
                    <div
                      className={`h-full rounded ${bar.color}`}
                      style={{ width: bar.width }}
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
            <a
              href="#"
              className="inline-block rounded-full bg-primary px-8 py-3 text-center text-sm font-semibold text-white"
            >
              View Full Dashboard
            </a>
            <p className="text-xs text-text-muted">
              Log in to see detailed patient data and trends
            </p>
          </div>
        </div>

        <div className="border-t border-border px-8 py-5 text-center">
          <p className="font-display text-sm text-primary italic">ReEntry</p>
          <p className="mt-1 text-xs text-text-muted">
            Bloom OB/GYN · Weekly Summary · Sent every Monday at 7:00 AM
          </p>
          <p className="mt-1 text-xs text-text-muted">
            <a href="#" className="underline">
              Unsubscribe
            </a>
            {" · "}
            <a href="#" className="underline">
              Notification Preferences
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
