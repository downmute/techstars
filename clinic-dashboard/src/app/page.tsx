"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PatientStatus = "on-track" | "watch" | "flagged";

interface CheckInFields {
	mood: number;
	anxiety: number;
	hopelessness: number;
	pain: number;
	physicalFunction: number;
	sleep: number;
	fatigue: number;
	support: number;
	babyCareConfidence: number;
	hardestTag: string;
}

interface FlagItem {
	id: string;
	type: string;
	severity: "urgent" | "high" | "medium" | "low";
	reason: string;
	suggestedAction: string;
	createdAt: string;
}

interface MockPatient {
	id: string;
	name: string;
	weeksPP: number;
	status: PatientStatus;
	deliveryType: string;
	feedingMethod: string;
	returnToWork: string;
	score: number;
	scoreDelta: number;
	streak: number;
	lastOpened: string;
	lastCheckedIn: string;
	voiceSessions: number;
	calendarConnected: boolean;
	physical: { score: number; delta: number; weight: number };
	mental: { score: number; delta: number; weight: number };
	sleep: { score: number; delta: number; weight: number };
	support: { score: number; delta: number; weight: number };
	todayCheckin: CheckInFields | null;
	todayReflection: string | null;
	trend: number[];
	journalSummaries: { date: string; score: number; summary: string }[];
	flags: FlagItem[];
	clinicalNote: string;
	calendarEvents: { title: string; time: string }[];
	voiceSessionSummary: string | null;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPatients: MockPatient[] = [
	{
		id: "1",
		name: "Patient 1",
		weeksPP: 4,
		status: "on-track",
		deliveryType: "Vaginal",
		feedingMethod: "Breastfeeding",
		returnToWork: "Jun 2, 2026",
		score: 82,
		scoreDelta: 4,
		streak: 12,
		lastOpened: "Today, 8:42 AM",
		lastCheckedIn: "Today, 8:42 AM",
		voiceSessions: 3,
		calendarConnected: true,
		physical: { score: 85, delta: 3, weight: 25 },
		mental: { score: 80, delta: 5, weight: 45 },
		sleep: { score: 82, delta: 2, weight: 30 },
		support: { score: 78, delta: 1, weight: 0 },
		todayCheckin: {
			mood: 4,
			anxiety: 2,
			hopelessness: 1,
			pain: 2,
			physicalFunction: 4,
			sleep: 4,
			fatigue: 2,
			support: 4,
			babyCareConfidence: 5,
			hardestTag: "Sleep deprivation",
		},
		todayReflection:
			"You've been steady and consistent this week. Your sleep scores are holding well at week 4, and your mood has lifted compared to last week. Keep building on your morning routine — it's clearly making a difference.",
		trend: [70, 72, 74, 76, 78, 80, 82],
		journalSummaries: [
			{
				date: "Mar 29",
				score: 82,
				summary:
					"Strong physical recovery continues. Mental wellbeing improving with better sleep patterns. Support network active and responsive. Baby care confidence at highest level recorded.",
			},
			{
				date: "Mar 28",
				score: 80,
				summary:
					"Good mood throughout the day. Mild fatigue noted but well within manageable range. Breastfeeding going smoothly. Partner support very positive today.",
			},
			{
				date: "Mar 27",
				score: 79,
				summary:
					"Sleep interrupted twice but patient returned to sleep quickly. Anxiety low. Physical function good — walking distance increasing.",
			},
			{
				date: "Mar 26",
				score: 78,
				summary:
					"Positive day overall. Social support from partner helping significantly with baby care tasks.",
			},
			{
				date: "Mar 25",
				score: 76,
				summary:
					"Slight perineal discomfort but declining steadily. Mood stable. Fatigue improving week over week.",
			},
			{
				date: "Mar 24",
				score: 74,
				summary:
					"First full week of structured daily check-ins complete. Overall scores trending upward. Patient engaged and motivated.",
			},
			{
				date: "Mar 23",
				score: 72,
				summary:
					"Baseline check-in established. Some fatigue expected at week 4 postpartum. Physical recovery on track.",
			},
		],
		flags: [],
		clinicalNote:
			"Patient 1 is progressing well at 4 weeks postpartum. Both physical (85) and mental (80) scores are in the healthy range and trending consistently upward over 7 days (+4 pts). A 12-day check-in streak indicates exceptional app engagement. No clinical flags active. Baby care confidence is at its highest recorded level (5/5). Recommend continuing current support plan and scheduling routine 6-week postpartum appointment. Return to work date (Jun 2) provides ample recovery runway.",
		calendarEvents: [
			{ title: "Pediatric check-up", time: "10:00 AM" },
			{ title: "Postpartum yoga class", time: "2:30 PM" },
		],
		voiceSessionSummary:
			"Patient discussed sleep improvements and feeling more connected with baby. Expressed mild, manageable anxiety about upcoming return-to-work date. Voice tone positive and engaged throughout session.",
	},
	{
		id: "3",
		name: "Patient 3",
		weeksPP: 2,
		status: "flagged",
		deliveryType: "C-Section",
		feedingMethod: "Breastfeeding",
		returnToWork: "May 12, 2026",
		score: 38,
		scoreDelta: -12,
		streak: 7,
		lastOpened: "Today, 7:15 AM",
		lastCheckedIn: "Today, 7:15 AM",
		voiceSessions: 1,
		calendarConnected: false,
		physical: { score: 42, delta: -5, weight: 25 },
		mental: { score: 28, delta: -14, weight: 45 },
		sleep: { score: 45, delta: -2, weight: 30 },
		support: { score: 35, delta: -6, weight: 0 },
		todayCheckin: {
			mood: 1,
			anxiety: 5,
			hopelessness: 4,
			pain: 4,
			physicalFunction: 2,
			sleep: 2,
			fatigue: 5,
			support: 2,
			babyCareConfidence: 2,
			hardestTag: "Feeling overwhelmed",
		},
		todayReflection:
			"Today feels heavy, and that's okay to acknowledge. Your scores show you're under a lot of pressure right now. You don't have to carry this alone — please reach out to your care team today.",
		trend: [62, 58, 52, 48, 44, 40, 38],
		journalSummaries: [
			{
				date: "Mar 29",
				score: 38,
				summary:
					"Mood at 1/5 for fourth consecutive day. Sleep quality critically low at 2/5. Anxiety and hopelessness both elevated. PPD screening urgently recommended. Patient checked in despite distress — engagement is a positive sign.",
			},
			{
				date: "Mar 28",
				score: 40,
				summary:
					"Continued decline in mental scores. C-section incision pain reported as moderate. Baby care confidence dropping significantly. Partner support inadequate per patient report.",
			},
			{
				date: "Mar 27",
				score: 44,
				summary:
					"Sleep severely interrupted. Patient notes feeling 'unable to cope.' Support network appears insufficient. Voice session attempted but ended early due to fatigue.",
			},
			{
				date: "Mar 26",
				score: 48,
				summary:
					"Physical recovery from C-section slower than expected. Breastfeeding pain adding stress. Emotional support flagged as critically inadequate.",
			},
			{
				date: "Mar 25",
				score: 52,
				summary:
					"Anxiety scores rising sharply. Patient reports feeling disconnected from baby. Early warning pattern detected.",
			},
			{
				date: "Mar 24",
				score: 58,
				summary:
					"First signs of mental health decline noted. Physical pain above baseline for C-section recovery timeline.",
			},
			{
				date: "Mar 23",
				score: 62,
				summary:
					"Initial check-in completed. Baseline established. Some fatigue and discomfort expected at 2 weeks post C-section.",
			},
		],
		flags: [
			{
				id: "f1",
				type: "PPD Risk",
				severity: "urgent",
				reason:
					"Mood scores 1–2/5 for 4+ consecutive days with concurrent sleep decline. Pattern consistent with PPD onset.",
				suggestedAction:
					"Administer EPDS screening today. Schedule 15-min phone check-in. Consider referral to perinatal mental health specialist.",
				createdAt: "Mar 28, 2026",
			},
			{
				id: "f2",
				type: "Sleep Disruption",
				severity: "high",
				reason:
					"Sleep quality below 2/5 for 5 consecutive days. Fatigue at maximum level (5/5). Co-occurring with mood decline.",
				suggestedAction:
					"Discuss sleep support options. Assess whether partner/family can assist with overnight care.",
				createdAt: "Mar 27, 2026",
			},
		],
		clinicalNote:
			"URGENT: Patient 3 requires immediate clinical attention. Mood scores have been 1–2/5 for four consecutive days alongside a steep decline in sleep quality — this pattern is clinically consistent with PPD onset. At only 2 weeks postpartum with C-section recovery adding physical burden (pain score 4/5), the mental health component (45% weight) is driving the overall score to a critical low (38, -12 pts this week). Hopelessness score of 4/5 today warrants immediate follow-up. EPDS screening and a phone check-in are strongly recommended today. Assess support network adequacy and consider referral to perinatal mental health if EPDS score is ≥13.",
		calendarEvents: [],
		voiceSessionSummary:
			"Patient expressed feeling alone and struggling with breastfeeding pain. Mentioned feeling 'like a failure.' Voice session ended early — patient noted feeling too exhausted to continue. Tone was distressed throughout.",
	},
	{
		id: "5",
		name: "Patient 5",
		weeksPP: 8,
		status: "watch",
		deliveryType: "Vaginal",
		feedingMethod: "Formula",
		returnToWork: "Apr 20, 2026",
		score: 56,
		scoreDelta: -3,
		streak: 3,
		lastOpened: "Yesterday, 9:20 PM",
		lastCheckedIn: "Yesterday",
		voiceSessions: 5,
		calendarConnected: true,
		physical: { score: 60, delta: -2, weight: 25 },
		mental: { score: 52, delta: -4, weight: 45 },
		sleep: { score: 58, delta: -1, weight: 30 },
		support: { score: 55, delta: -3, weight: 0 },
		todayCheckin: null,
		todayReflection: null,
		trend: [60, 59, 58, 57, 57, 56, 56],
		journalSummaries: [
			{
				date: "Mar 28",
				score: 56,
				summary:
					"Pain at incision site noted — unusual at 8 weeks postpartum. Fatigue elevated above expected levels. Mental scores dipping with return-to-work anxiety increasing.",
			},
			{
				date: "Mar 27",
				score: 57,
				summary:
					"Patient notes anxiety increasing as RTW date (Apr 20) approaches. Sleep slightly disrupted. Childcare logistics mentioned as a stressor.",
			},
			{
				date: "Mar 26",
				score: 57,
				summary:
					"Stable but stagnant. No improvement this week despite expected 8-week recovery gains. Physical recovery plateau possible.",
			},
			{
				date: "Mar 25",
				score: 58,
				summary:
					"Mild physical decline. Fatigue and pain together suggesting incomplete recovery at week 8. Monitor closely.",
			},
			{
				date: "Mar 24",
				score: 58,
				summary:
					"Check-in completed. Some work transition anxiety mentioned in check-in notes. Support score declining.",
			},
			{
				date: "Mar 23",
				score: 59,
				summary:
					"Overall stable. Mental health holding but watch status warranted as RTW date approaches quickly.",
			},
			{
				date: "Mar 22",
				score: 60,
				summary:
					"Week started at reasonable baseline. Physical function adequate. Patient engaged with 5 voice sessions this week.",
			},
		],
		flags: [
			{
				id: "f3",
				type: "Physical Recovery Stall",
				severity: "medium",
				reason:
					"No improvement in physical scores for 7 days at 8 weeks PP. Pain reported at episiotomy site — atypical at this stage.",
				suggestedAction:
					"Assess wound healing at next visit. Rule out infection or delayed healing.",
				createdAt: "Mar 27, 2026",
			},
		],
		clinicalNote:
			"Patient 5 at 8 weeks postpartum is showing a slow but persistent decline across all domains (-3 pts this week). Physical recovery has stalled — pain at the episiotomy site at this stage warrants physical assessment to rule out complications. Mental health scores are declining with the return-to-work date (Apr 20) 3 weeks away. The patient has a strong voice session history (5 this week) indicating good engagement, but today's missed check-in (first in 3 days) is worth noting. Recommend proactive outreach, RTW transition planning discussion, and wound check at next appointment.",
		calendarEvents: [
			{ title: "Return-to-work prep call with HR", time: "11:00 AM" },
			{ title: "Baby wellness check", time: "3:00 PM" },
		],
		voiceSessionSummary:
			"Patient discussed work transition stress, childcare logistics, and lingering physical discomfort. Expressed concern about not feeling 'ready' to return. 5 voice sessions this week — highest engagement of any patient. Positive rapport established.",
	},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecoveryRing({ score, size = 100 }: { score: number; size?: number }) {
	const strokeWidth = size * 0.08;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;
	const color = score >= 70 ? "#5A8A6A" : score >= 50 ? "#C4925A" : "#B5404A";

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			aria-label={`Recovery score ${score}`}
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="#E8DDD4"
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				transform={`rotate(-90 ${size / 2} ${size / 2})`}
			/>
			<text
				x={size / 2}
				y={size / 2 - 4}
				textAnchor="middle"
				dominantBaseline="middle"
				fill="#2C1F1A"
				fontSize={size * 0.26}
				fontWeight="700"
				fontFamily="var(--font-display)"
			>
				{score}
			</text>
			<text
				x={size / 2}
				y={size / 2 + size * 0.2}
				textAnchor="middle"
				dominantBaseline="middle"
				fill="#B39B93"
				fontSize={size * 0.1}
			>
				/ 100
			</text>
		</svg>
	);
}

function SubScoreBar({
	label,
	score,
	delta,
	weight,
}: {
	label: string;
	score: number;
	delta: number;
	weight: number;
}) {
	const barColor =
		score >= 70 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-danger";
	const deltaColor = delta >= 0 ? "text-success" : "text-danger";

	return (
		<div className="rounded-2xl border border-border bg-surface p-5">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
					{label}
				</p>
				<p className="text-xs text-text-muted">Weight: {weight}%</p>
			</div>
			<div className="mt-2 flex items-baseline gap-2">
				<span className="font-display text-3xl text-text">{score}</span>
				<span className={`text-sm font-semibold ${deltaColor}`}>
					{delta >= 0 ? "+" : ""}
					{delta} this week
				</span>
			</div>
			<div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
				<div
					className={`h-full rounded-full ${barColor} transition-all`}
					style={{ width: `${score}%` }}
				/>
			</div>
		</div>
	);
}

function RatingDots({
	label,
	value,
	max = 5,
	invertBad = false,
}: {
	label: string;
	value: number;
	max?: number;
	invertBad?: boolean;
}) {
	// invertBad: for anxiety/pain/hopelessness/fatigue, high = bad
	const getColor = (i: number) => {
		if (i >= value) return "bg-surface-raised";
		if (invertBad) {
			if (value >= 4) return "bg-danger";
			if (value === 3) return "bg-warning";
			return "bg-success";
		}
		if (value <= 2) return "bg-danger";
		if (value === 3) return "bg-warning";
		return "bg-success";
	};

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-text-secondary">{label}</span>
			<div className="flex items-center gap-1">
				{Array.from({ length: max }).map((_, i) => (
					<div
						key={i}
						className={`h-2.5 w-2.5 rounded-full ${getColor(i)} transition-colors`}
					/>
				))}
				<span className="ml-1.5 text-xs font-semibold text-text">
					{value}/{max}
				</span>
			</div>
		</div>
	);
}

function Sparkline7({
	data,
	status,
}: {
	data: number[];
	status: PatientStatus;
}) {
	if (!data.length) return null;
	const width = 200;
	const height = 48;
	const pad = 4;
	const min = Math.min(...data) - 2;
	const max = Math.max(...data) + 2;
	const range = max - min || 1;
	const color =
		status === "on-track"
			? "#5A8A6A"
			: status === "watch"
				? "#C4925A"
				: "#B5404A";

	const points = data
		.map((v, i) => {
			const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
			const y = height - pad - ((v - min) / range) * (height - pad * 2);
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg width={width} height={height} className="block w-full">
			<polyline
				points={points}
				fill="none"
				stroke={color}
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function StatusBadge({ status }: { status: PatientStatus }) {
	const config = {
		"on-track": {
			dot: "bg-success",
			text: "text-success",
			bg: "bg-success/10",
			label: "On track",
		},
		watch: {
			dot: "bg-warning",
			text: "text-warning",
			bg: "bg-warning/10",
			label: "Watch",
		},
		flagged: {
			dot: "bg-danger",
			text: "text-danger",
			bg: "bg-danger/10",
			label: "Needs follow-up",
		},
	}[status];

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${config.bg} ${config.text}`}
		>
			<span className={`h-2 w-2 rounded-full ${config.dot}`} />
			{config.label}
		</span>
	);
}

function SeverityBadge({ severity }: { severity: FlagItem["severity"] }) {
	const config = {
		urgent: { bg: "bg-danger", text: "text-white", label: "Urgent" },
		high: { bg: "bg-danger/15", text: "text-danger", label: "High" },
		medium: { bg: "bg-warning/15", text: "text-warning", label: "Medium" },
		low: { bg: "bg-success/10", text: "text-success", label: "Low" },
	}[severity];

	return (
		<span
			className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase ${config.bg} ${config.text}`}
		>
			{config.label}
		</span>
	);
}

function ScorePill({ score }: { score: number }) {
	const color =
		score >= 70
			? "bg-success/10 text-success"
			: score >= 50
				? "bg-warning/10 text-warning"
				: "bg-danger/10 text-danger";
	return (
		<span
			className={`inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-sm font-bold ${color}`}
		>
			{score}
		</span>
	);
}

// ─── Sidebar (inline for /mock, no auth) ─────────────────────────────────────

function MockSidebar({
	selectedId,
	onSelect,
}: {
	selectedId: string;
	onSelect: (id: string) => void;
}) {
	return (
		<aside className="flex h-full w-[220px] flex-shrink-0 flex-col bg-sidebar px-5 py-8">
			<div className="mb-10">
				<h1 className="font-display text-xl text-sidebar-text">ReEntry</h1>
				<p className="text-xs tracking-widest text-text-muted uppercase">
					Clinic Dashboard
				</p>
			</div>

			<nav className="flex flex-1 flex-col gap-1">
				<div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-text/40 cursor-not-allowed select-none">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
						<rect x="1" y="1" width="7" height="7" rx="2" stroke="#E8DDD4" strokeWidth="1.5" opacity="0.4" />
						<rect x="10" y="1" width="7" height="7" rx="2" stroke="#E8DDD4" strokeWidth="1.5" opacity="0.4" />
						<rect x="1" y="10" width="7" height="7" rx="2" stroke="#E8DDD4" strokeWidth="1.5" opacity="0.4" />
						<rect x="10" y="10" width="7" height="7" rx="2" stroke="#E8DDD4" strokeWidth="1.5" opacity="0.4" />
					</svg>
					Patients
				</div>
				<div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-text/40 cursor-not-allowed select-none">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
						<path d="M9 2L16 15H2L9 2Z" stroke="#E8DDD4" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
						<path d="M9 7V10" stroke="#E8DDD4" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
						<circle cx="9" cy="12.5" r="0.75" fill="#E8DDD4" opacity="0.4" />
					</svg>
					Alerts
				</div>

				<div className="mt-3 mb-1.5 px-3">
					<p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase">
						Mock Preview
					</p>
				</div>

				{mockPatients.map((p) => {
					const isActive = p.id === selectedId;
					const dot =
						p.status === "on-track"
							? "bg-success"
							: p.status === "watch"
								? "bg-warning"
								: "bg-danger";
					return (
						<button
							key={p.id}
							onClick={() => onSelect(p.id)}
							className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${
								isActive
									? "bg-sidebar-active text-white font-medium"
									: "text-sidebar-text hover:bg-sidebar-active/20"
							}`}
						>
							<span
								className={`h-2 w-2 flex-shrink-0 rounded-full ${dot}`}
							/>
							<span className="truncate">{p.name}</span>
							<span className="ml-auto text-xs opacity-60">
								{p.weeksPP}w PP
							</span>
						</button>
					);
				})}
			</nav>

			<div className="border-t border-white/10 pt-4">
				<p className="text-sm text-sidebar-text">Dr. Sarah Chen</p>
				<p className="text-xs text-text-muted">Pacific Women's Clinic</p>
				<p className="mt-2 text-xs text-text-muted/60 italic">Mock preview mode</p>
			</div>
		</aside>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MockDashboardPage() {
	const [selectedId, setSelectedId] = useState<string>("1");
	const patient = mockPatients.find((p) => p.id === selectedId)!;

	const circumference = 2 * Math.PI * 42;
	const ringOffset =
		circumference - (patient.score / 100) * circumference;
	const ringColor =
		patient.score >= 70
			? "#5A8A6A"
			: patient.score >= 50
				? "#C4925A"
				: "#B5404A";

	return (
		<div className="flex h-screen bg-background">
			<MockSidebar selectedId={selectedId} onSelect={setSelectedId} />

			<main className="flex-1 overflow-auto px-8 py-8">
				{/* Breadcrumb */}
				<div className="mb-5 flex items-center gap-2 text-sm text-text-muted">
					<span className="font-medium text-text-muted">Patients</span>
					<span>/</span>
					<span className="text-text">{patient.name}</span>
					<span>/</span>
					<span className="text-text">App Overview</span>
				</div>

				{/* ── Patient Header Card ─────────────────────────────── */}
				<div className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface">
					{/* Status stripe */}
					<div
						className={`h-1 w-full ${
							patient.status === "on-track"
								? "bg-success"
								: patient.status === "watch"
									? "bg-warning"
									: "bg-danger"
						}`}
					/>
					<div className="flex items-center justify-between px-8 py-6">
						{/* Left: Avatar + info */}
						<div className="flex items-center gap-5">
							<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/20">
								<span className="font-display text-2xl text-primary">
									P{patient.id}
								</span>
							</div>
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-xl font-semibold text-text">
										{patient.name}
									</h1>
									<StatusBadge status={patient.status} />
								</div>
								<p className="mt-0.5 text-sm text-text-secondary">
									{patient.weeksPP} weeks postpartum
								</p>
								<div className="mt-3 flex flex-wrap gap-6">
									{[
										{ label: "Delivery", value: patient.deliveryType },
										{ label: "Feeding", value: patient.feedingMethod },
										{
											label: "Return to Work",
											value: patient.returnToWork,
										},
										{
											label: "Last Check-in",
											value: patient.lastCheckedIn,
										},
									].map(({ label, value }) => (
										<div key={label}>
											<p className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
												{label}
											</p>
											<p className="mt-0.5 text-sm font-medium text-text">
												{value}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Right: Recovery ring + app stats */}
						<div className="flex items-center gap-8">
							{/* App activity chips */}
							<div className="flex flex-col gap-2.5 text-right">
								<div className="flex items-center justify-end gap-2">
									<span className="text-xs text-text-muted">Last opened</span>
									<span className="rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-semibold text-text">
										{patient.lastOpened}
									</span>
								</div>
								<div className="flex items-center justify-end gap-2">
									<span className="text-xs text-text-muted">Check-in streak</span>
									<span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
										{patient.streak} days
									</span>
								</div>
								<div className="flex items-center justify-end gap-2">
									<span className="text-xs text-text-muted">Voice sessions</span>
									<span className="rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-semibold text-text">
										{patient.voiceSessions} this week
									</span>
								</div>
								<div className="flex items-center justify-end gap-2">
									<span className="text-xs text-text-muted">Calendar</span>
									<span
										className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
											patient.calendarConnected
												? "bg-success/10 text-success"
												: "bg-surface-raised text-text-muted"
										}`}
									>
										{patient.calendarConnected ? "Connected" : "Not connected"}
									</span>
								</div>
							</div>

							{/* Recovery ring */}
							<div className="flex flex-col items-center">
								<svg
									width="110"
									height="110"
									viewBox="0 0 96 96"
									aria-label="Recovery score"
								>
									<circle
										cx="48"
										cy="48"
										r="42"
										fill="none"
										stroke="#E8DDD4"
										strokeWidth="7"
									/>
									<circle
										cx="48"
										cy="48"
										r="42"
										fill="none"
										stroke={ringColor}
										strokeWidth="7"
										strokeLinecap="round"
										strokeDasharray={circumference}
										strokeDashoffset={ringOffset}
										transform="rotate(-90 48 48)"
									/>
									<text
										x="48"
										y="44"
										textAnchor="middle"
										dominantBaseline="middle"
										fill="#2C1F1A"
										fontSize="22"
										fontWeight="700"
										fontFamily="var(--font-display)"
									>
										{patient.score}
									</text>
									<text
										x="48"
										y="60"
										textAnchor="middle"
										dominantBaseline="middle"
										fill="#B39B93"
										fontSize="9"
									>
										Recovery
									</text>
								</svg>
								<div className="mt-1 flex items-center gap-1">
									<span
										className={`text-sm font-bold ${patient.scoreDelta >= 0 ? "text-success" : "text-danger"}`}
									>
										{patient.scoreDelta >= 0 ? "+" : ""}
										{patient.scoreDelta} pts
									</span>
									<span className="text-xs text-text-muted">this week</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ── Domain Score Cards ──────────────────────────────── */}
				<div className="mb-5 grid grid-cols-4 gap-4">
					<SubScoreBar
						label="Physical"
						score={patient.physical.score}
						delta={patient.physical.delta}
						weight={patient.physical.weight}
					/>
					<SubScoreBar
						label="Mental"
						score={patient.mental.score}
						delta={patient.mental.delta}
						weight={patient.mental.weight}
					/>
					<SubScoreBar
						label="Sleep"
						score={patient.sleep.score}
						delta={patient.sleep.delta}
						weight={patient.sleep.weight}
					/>
					<SubScoreBar
						label="Support"
						score={patient.support.score}
						delta={patient.support.delta}
						weight={0}
					/>
				</div>

				{/* ── Today's Activity + 7-Day Trend ──────────────────── */}
				<div className="mb-5 grid grid-cols-3 gap-5">
					{/* Left: Today's reflection + check-in */}
					<div className="col-span-2 flex flex-col gap-4">
						{/* Reflection card (matches mobile primary card) */}
						<div
							className={`rounded-2xl p-6 ${
								patient.todayReflection
									? "bg-primary"
									: "border border-border bg-surface"
							}`}
						>
							<p
								className={`mb-3 text-xs font-bold tracking-widest uppercase ${
									patient.todayReflection
										? "text-white/60"
										: "text-text-muted"
								}`}
							>
								Today&apos;s Reflection
							</p>
							{patient.todayReflection ? (
								<p className="font-display text-lg leading-relaxed text-white">
									{patient.todayReflection}
								</p>
							) : (
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
										>
											<circle
												cx="8"
												cy="8"
												r="6.5"
												stroke="#B39B93"
												strokeWidth="1.5"
											/>
											<path
												d="M8 5v3.5"
												stroke="#B39B93"
												strokeWidth="1.5"
												strokeLinecap="round"
											/>
											<circle cx="8" cy="11" r="0.75" fill="#B39B93" />
										</svg>
									</div>
									<p className="text-sm text-text-secondary">
										No check-in today — reflection will appear after
										patient completes their daily check-in.
									</p>
								</div>
							)}
						</div>

						{/* Today's check-in breakdown */}
						{patient.todayCheckin ? (
							<div className="rounded-2xl border border-border bg-surface p-6">
								<div className="mb-4 flex items-center justify-between">
									<h2 className="font-display text-lg text-text">
										Today&apos;s Check-in
									</h2>
									<div className="flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-success" />
										<span className="text-xs font-medium text-success">
											Completed {patient.lastCheckedIn}
										</span>
									</div>
								</div>

								{/* Rating dots grid */}
								<div className="grid grid-cols-3 gap-x-8 gap-y-4">
									<RatingDots
										label="Mood"
										value={patient.todayCheckin.mood}
									/>
									<RatingDots
										label="Anxiety"
										value={patient.todayCheckin.anxiety}
										invertBad
									/>
									<RatingDots
										label="Hopelessness"
										value={patient.todayCheckin.hopelessness}
										invertBad
									/>
									<RatingDots
										label="Pain"
										value={patient.todayCheckin.pain}
										invertBad
									/>
									<RatingDots
										label="Physical Function"
										value={patient.todayCheckin.physicalFunction}
									/>
									<RatingDots
										label="Sleep Quality"
										value={patient.todayCheckin.sleep}
									/>
									<RatingDots
										label="Fatigue"
										value={patient.todayCheckin.fatigue}
										invertBad
									/>
									<RatingDots
										label="Support"
										value={patient.todayCheckin.support}
									/>
									<RatingDots
										label="Baby Care Confidence"
										value={patient.todayCheckin.babyCareConfidence}
									/>
								</div>

								{/* Hardest tag */}
								<div className="mt-4 border-t border-border pt-4">
									<span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
										Hardest thing today
									</span>
									<span className="ml-3 rounded-full bg-blush/40 px-3 py-1 text-sm font-medium text-primary">
										{patient.todayCheckin.hardestTag}
									</span>
								</div>
							</div>
						) : (
							<div className="rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center">
								<p className="text-sm text-text-secondary">
									No check-in today yet
								</p>
								<p className="mt-1 text-xs text-text-muted">
									Last check-in: {patient.lastCheckedIn}
								</p>
							</div>
						)}
					</div>

					{/* Right: 7-day trend per domain */}
					<div className="flex flex-col gap-4">
						<div className="rounded-2xl border border-border bg-surface p-5">
							<h2 className="mb-4 font-display text-lg text-text">
								7-Day Trend
							</h2>

							<div className="flex flex-col gap-5">
								{/* Overall */}
								<div>
									<div className="mb-1.5 flex items-center justify-between">
										<span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
											Overall
										</span>
										<div className="flex items-center gap-1.5">
											{patient.trend.map((v, i) => (
												<ScorePill key={i} score={v} />
											)).slice(-1)}
										</div>
									</div>
									<Sparkline7
										data={patient.trend}
										status={patient.status}
									/>
									<div className="mt-1 flex justify-between text-[10px] text-text-muted">
										<span>Mar 23</span>
										<span>Mar 29</span>
									</div>
								</div>

								<div className="h-px bg-border" />

								{/* Domains */}
								{[
									{
										label: "Physical",
										data: patient.trend.map(
											(v) => Math.min(100, v + patient.physical.score - patient.score),
										),
										color: "#D4856A",
									},
									{
										label: "Mental",
										data: patient.trend.map(
											(v) => Math.max(5, v + patient.mental.score - patient.score),
										),
										color: "#B5404A",
									},
									{
										label: "Sleep",
										data: patient.trend.map(
											(v) => Math.max(5, v + patient.sleep.score - patient.score),
										),
										color: "#B39B93",
									},
								].map(({ label, data, color }) => (
									<div key={label}>
										<div className="mb-1.5 flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<span
													className="inline-block h-2.5 w-2.5 rounded-full"
													style={{ backgroundColor: color }}
												/>
												<span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
													{label}
												</span>
											</div>
											<span className="text-xs font-bold text-text">
												{data[data.length - 1]}
											</span>
										</div>
										<svg
											width="100%"
											height="32"
											viewBox="0 0 200 32"
											preserveAspectRatio="none"
											className="block"
										>
											<polyline
												points={data
													.map((v, i) => {
														const min = Math.min(...data) - 2;
														const max = Math.max(...data) + 2;
														const range = max - min || 1;
														const x =
															(i / (data.length - 1)) * 196 + 2;
														const y =
															30 - ((v - min) / range) * 28;
														return `${x},${y}`;
													})
													.join(" ")}
												fill="none"
												stroke={color}
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
								))}
							</div>
						</div>

						{/* Calendar today */}
						{patient.calendarConnected &&
							patient.calendarEvents.length > 0 && (
								<div className="rounded-2xl border border-border bg-surface p-5">
									<p className="mb-3 text-xs font-bold tracking-widest text-text-muted uppercase">
										Patient&apos;s Calendar Today
									</p>
									<div className="flex flex-col">
										{patient.calendarEvents.map((ev, i) => (
											<div key={i}>
												{i > 0 && (
													<div className="my-2 h-px bg-border" />
												)}
												<div className="flex items-center gap-3">
													<div className="h-8 w-1 rounded-full bg-primary" />
													<div>
														<p className="text-sm font-medium text-text">
															{ev.title}
														</p>
														<p className="text-xs text-text-secondary">
															{ev.time}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
					</div>
				</div>

				{/* ── Journal Timeline + App Activity ─────────────────── */}
				<div className="mb-5 grid grid-cols-3 gap-5">
					{/* Journal: 7-day history */}
					<div className="col-span-2 rounded-2xl border border-border bg-surface p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-display text-lg text-text">
								Journal — 7-Day History
							</h2>
							<span className="text-xs text-text-muted">
								AI-generated daily summaries
							</span>
						</div>
						<div className="flex flex-col gap-3">
							{patient.journalSummaries.map((entry, i) => {
								const scoreColor =
									entry.score >= 70
										? "bg-success/10 text-success"
										: entry.score >= 50
											? "bg-warning/10 text-warning"
											: "bg-danger/10 text-danger";
								return (
									<div
										key={i}
										className={`rounded-xl p-4 ${i === 0 ? "bg-surface-raised" : "border border-border"}`}
									>
										<div className="mb-2 flex items-center gap-3">
											<span className="text-xs font-bold text-text-muted w-12">
												{entry.date}
											</span>
											<span
												className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor}`}
											>
												{entry.score}
											</span>
											{i === 0 && (
												<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
													Latest
												</span>
											)}
										</div>
										<p className="text-sm leading-relaxed text-text-secondary">
											{entry.summary}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					{/* App activity */}
					<div className="flex flex-col gap-4">
						{/* Voice session summary */}
						{patient.voiceSessionSummary && (
							<div className="rounded-2xl border border-border bg-surface p-5">
								<div className="mb-3 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
										<svg
											width="16"
											height="16"
											viewBox="0 0 16 16"
											fill="none"
										>
											<ellipse
												cx="8"
												cy="6.5"
												rx="3"
												ry="4.5"
												stroke="#B5604F"
												strokeWidth="1.5"
											/>
											<path
												d="M3 9.5C3 12 5.24 14 8 14s5-2 5-4.5"
												stroke="#B5604F"
												strokeWidth="1.5"
												strokeLinecap="round"
											/>
											<path
												d="M8 14v2"
												stroke="#B5604F"
												strokeWidth="1.5"
												strokeLinecap="round"
											/>
										</svg>
									</div>
									<div>
										<p className="text-xs font-bold text-text">
											Voice Sessions
										</p>
										<p className="text-[10px] text-text-muted">
											{patient.voiceSessions} this week
										</p>
									</div>
								</div>
								<p className="text-sm leading-relaxed text-text-secondary">
									{patient.voiceSessionSummary}
								</p>
							</div>
						)}

						{/* App engagement stats */}
						<div className="rounded-2xl border border-border bg-surface p-5">
							<p className="mb-3 text-xs font-bold tracking-widest text-text-muted uppercase">
								App Engagement
							</p>
							<div className="flex flex-col gap-3">
								{[
									{
										label: "Check-in streak",
										value: `${patient.streak} days`,
										highlight: true,
									},
									{
										label: "Last app open",
										value: patient.lastOpened,
										highlight: false,
									},
									{
										label: "Voice sessions",
										value: `${patient.voiceSessions} this week`,
										highlight: false,
									},
									{
										label: "Calendar sync",
										value: patient.calendarConnected ? "Active" : "Not set up",
										highlight: patient.calendarConnected,
									},
								].map(({ label, value, highlight }) => (
									<div
										key={label}
										className="flex items-center justify-between"
									>
										<span className="text-xs text-text-secondary">
											{label}
										</span>
										<span
											className={`text-xs font-semibold ${highlight ? "text-primary" : "text-text"}`}
										>
											{value}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* ── Active Flags ──────────────────────────────────────── */}
				{patient.flags.length > 0 && (
					<div className="mb-5 rounded-2xl border border-danger/20 bg-danger/5 p-6">
						<div className="mb-4 flex items-center gap-3">
							<svg
								width="20"
								height="20"
								viewBox="0 0 18 18"
								fill="none"
							>
								<path
									d="M9 2L16 15H2L9 2Z"
									stroke="#B5404A"
									strokeWidth="1.5"
									strokeLinejoin="round"
								/>
								<path
									d="M9 7V10"
									stroke="#B5404A"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
								<circle cx="9" cy="12.5" r="0.75" fill="#B5404A" />
							</svg>
							<h2 className="font-display text-lg text-danger">
								Active Clinical Flags
							</h2>
							<span className="ml-auto rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-bold text-danger">
								{patient.flags.length} active
							</span>
						</div>
						<div className="flex flex-col gap-4">
							{patient.flags.map((flag) => (
								<div
									key={flag.id}
									className="rounded-xl border border-border bg-background p-5"
								>
									<div className="mb-2 flex items-center gap-3">
										<SeverityBadge severity={flag.severity} />
										<span className="font-semibold text-text">
											{flag.type}
										</span>
										<span className="ml-auto text-xs text-text-muted">
											Flagged {flag.createdAt}
										</span>
									</div>
									<p className="mb-3 text-sm leading-relaxed text-text-secondary">
										{flag.reason}
									</p>
									<div className="rounded-lg bg-surface p-3">
										<p className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
											Suggested action
										</p>
										<p className="mt-1 text-sm font-medium text-text">
											{flag.suggestedAction}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ── AI Clinical Notes ─────────────────────────────────── */}
				<div className="rounded-2xl bg-sidebar p-6 text-sidebar-text">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="font-display text-xl">AI Clinical Summary</h2>
						<span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-sidebar-text/70 uppercase">
							AI-Generated · For Review
						</span>
					</div>
					<p className="text-base leading-relaxed text-sidebar-text/85">
						{patient.clinicalNote}
					</p>
					<p className="mt-4 text-xs text-sidebar-text/40">
						Generated from patient check-in data, recovery scores, and app
						activity. Always apply clinical judgment. Not a substitute for
						direct patient assessment.
					</p>
				</div>
			</main>
		</div>
	);
}
