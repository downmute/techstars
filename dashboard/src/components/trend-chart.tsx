"use client";

import type { PatientStatus } from "@/lib/mock-data";

interface TrendChartProps {
	score: number;
	status: PatientStatus;
}

function generateTrendData(baseScore: number, status: PatientStatus) {
	const days = 30;
	const data: {
		overall: number[];
		physical: number[];
		mental: number[];
		sleep: number[];
	} = {
		overall: [],
		physical: [],
		mental: [],
		sleep: [],
	};

	for (let i = 0; i < days; i++) {
		const progress = i / (days - 1);
		if (status === "flagged") {
			data.overall.push(
				Math.max(
					20,
					baseScore + 25 - progress * 25 + (Math.random() - 0.5) * 4,
				),
			);
			data.physical.push(
				Math.max(
					20,
					baseScore + 20 - progress * 15 + (Math.random() - 0.5) * 5,
				),
			);
			data.mental.push(
				Math.max(
					15,
					baseScore + 15 - progress * 25 + (Math.random() - 0.5) * 4,
				),
			);
			data.sleep.push(
				Math.max(
					25,
					baseScore + 18 - progress * 12 + (Math.random() - 0.5) * 5,
				),
			);
		} else if (status === "watch") {
			data.overall.push(
				baseScore + 5 - progress * 5 + (Math.random() - 0.5) * 3,
			);
			data.physical.push(
				baseScore + 8 - progress * 4 + (Math.random() - 0.5) * 4,
			);
			data.mental.push(
				baseScore - 2 - progress * 6 + (Math.random() - 0.5) * 3,
			);
			data.sleep.push(baseScore + 4 - progress * 3 + (Math.random() - 0.5) * 4);
		} else {
			data.overall.push(
				baseScore - 10 + progress * 10 + (Math.random() - 0.5) * 3,
			);
			data.physical.push(
				baseScore - 8 + progress * 8 + (Math.random() - 0.5) * 4,
			);
			data.mental.push(
				baseScore - 12 + progress * 12 + (Math.random() - 0.5) * 3,
			);
			data.sleep.push(baseScore - 6 + progress * 6 + (Math.random() - 0.5) * 4);
		}
	}
	return data;
}

function buildPath(
	values: number[],
	width: number,
	height: number,
	minVal: number,
	maxVal: number,
) {
	const range = maxVal - minVal || 1;
	const padding = 20;
	return values
		.map((v, i) => {
			const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
			const y =
				height - padding - ((v - minVal) / range) * (height - padding * 2);
			return `${i === 0 ? "M" : "L"}${x},${y}`;
		})
		.join(" ");
}

export function TrendChart({ score, status }: TrendChartProps) {
	const data = generateTrendData(score, status);
	const allValues = [
		...data.overall,
		...data.physical,
		...data.mental,
		...data.sleep,
	];
	const minVal = Math.min(...allValues) - 5;
	const maxVal = Math.max(...allValues) + 5;

	const width = 700;
	const height = 250;
	const dates = ["Mar 1", "Mar 8", "Mar 15", "Mar 22", "Mar 29"];

	const lines = [
		{ key: "overall", color: "#B5604F", data: data.overall },
		{ key: "physical", color: "#D4856A", data: data.physical },
		{ key: "mental", color: "#B5404A", data: data.mental },
		{ key: "sleep", color: "#B39B93", data: data.sleep },
	];

	return (
		<svg
			viewBox={`0 0 ${width} ${height + 30}`}
			className="w-full"
			preserveAspectRatio="xMidYMid meet"
		>
			{[0.25, 0.5, 0.75].map((frac) => {
				const y = height - 20 - frac * (height - 40);
				return (
					<line
						key={frac}
						x1="20"
						y1={y}
						x2={width - 20}
						y2={y}
						stroke="#E8DDD4"
						strokeWidth="1"
					/>
				);
			})}

			{lines.map((line) => (
				<path
					key={line.key}
					d={buildPath(line.data, width, height, minVal, maxVal)}
					fill="none"
					stroke={line.color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			))}

			{dates.map((label, i) => {
				const x = (i / (dates.length - 1)) * (width - 40) + 20;
				return (
					<text
						key={label}
						x={x}
						y={height + 20}
						textAnchor="middle"
						className="text-xs"
						fill="#B39B93"
					>
						{label}
					</text>
				);
			})}
		</svg>
	);
}
