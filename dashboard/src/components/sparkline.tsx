"use client";

import type { PatientStatus } from "@/lib/mock-data";

interface SparklineProps {
	data: number[];
	status: PatientStatus;
	width?: number;
	height?: number;
}

const statusColors: Record<PatientStatus, string> = {
	"on-track": "#5A8A6A",
	watch: "#C4925A",
	flagged: "#B5404A",
};

export function Sparkline({
	data,
	status,
	width = 120,
	height = 32,
}: SparklineProps) {
	if (!data.length) return null;

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const padding = 4;

	const points = data
		.map((val, i) => {
			const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
			const y =
				height - padding - ((val - min) / range) * (height - padding * 2);
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg width={width} height={height} className="block">
			<polyline
				points={points}
				fill="none"
				stroke={statusColors[status]}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
