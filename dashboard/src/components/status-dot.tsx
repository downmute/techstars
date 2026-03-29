import type { PatientStatus } from "@/lib/mock-data";

const dotColors: Record<PatientStatus, string> = {
	"on-track": "bg-success",
	watch: "bg-warning",
	flagged: "bg-danger",
};

const textColors: Record<PatientStatus, string> = {
	"on-track": "text-success",
	watch: "text-warning",
	flagged: "text-danger",
};

export function StatusDot({
	status,
	label,
}: {
	status: PatientStatus;
	label: string;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<span className={`h-2 w-2 rounded-full ${dotColors[status]}`} />
			<span className={`text-sm font-medium ${textColors[status]}`}>
				{label}
			</span>
		</div>
	);
}
