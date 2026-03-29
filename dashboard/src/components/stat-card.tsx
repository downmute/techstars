interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  subtitleColor?: string;
}

export function StatCard({ label, value, subtitle, subtitleColor = "text-text-secondary" }: StatCardProps) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-surface px-6 py-5">
      <p className="mb-1 text-xs font-medium tracking-widest text-text-secondary uppercase">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl text-text">{value}</span>
        <span className={`text-sm ${subtitleColor}`}>{subtitle}</span>
      </div>
    </div>
  );
}
