export type PatientStatus = "on-track" | "watch" | "flagged";

export interface Patient {
	id: string;
	name: string;
	weeksPP: number;
	score: number;
	scoreDelta: number;
	trend: number[];
	lastCheckIn: string;
	status: PatientStatus;
	flags: number;
	deliveryType?: string;
	feedingMethod?: string;
	returnToWork?: string;
	physical?: { score: number; delta: number; weight: number };
	mental?: { score: number; delta: number; weight: number };
	sleep?: { score: number; delta: number; weight: number };
}

export const patients: Patient[] = [
	{
		id: "1",
		name: "Patient 1",
		weeksPP: 4,
		score: 82,
		scoreDelta: 4,
		trend: [76, 78, 78, 80, 81, 82, 82],
		lastCheckIn: "Today, 8:42 AM",
		status: "on-track",
		flags: 0,
		deliveryType: "Vaginal",
		feedingMethod: "Breast",
		returnToWork: "Jun 2, 2026",
		physical: { score: 85, delta: 3, weight: 25 },
		mental: { score: 80, delta: 5, weight: 45 },
		sleep: { score: 82, delta: 2, weight: 30 },
	},
	{
		id: "3",
		name: "Patient 3",
		weeksPP: 2,
		score: 38,
		scoreDelta: -12,
		trend: [62, 58, 52, 48, 44, 40, 38],
		lastCheckIn: "Today, 7:15 AM",
		status: "flagged",
		flags: 2,
		deliveryType: "C-Section",
		feedingMethod: "Breast",
		returnToWork: "May 12, 2026",
		physical: { score: 42, delta: -5, weight: 25 },
		mental: { score: 28, delta: -14, weight: 45 },
		sleep: { score: 45, delta: -2, weight: 30 },
	},
	{
		id: "5",
		name: "Patient 5",
		weeksPP: 8,
		score: 56,
		scoreDelta: -3,
		trend: [60, 59, 58, 57, 57, 56, 56],
		lastCheckIn: "Yesterday",
		status: "watch",
		flags: 1,
		deliveryType: "Vaginal",
		feedingMethod: "Formula",
		returnToWork: "Apr 20, 2026",
		physical: { score: 60, delta: -2, weight: 25 },
		mental: { score: 52, delta: -4, weight: 45 },
		sleep: { score: 58, delta: -1, weight: 30 },
	},
	{
		id: "7",
		name: "Patient 7",
		weeksPP: 10,
		score: 73,
		scoreDelta: 1,
		trend: [70, 71, 71, 72, 72, 73, 73],
		lastCheckIn: "Today, 9:10 AM",
		status: "on-track",
		flags: 0,
		deliveryType: "Vaginal",
		feedingMethod: "Breast",
		returnToWork: "Apr 5, 2026",
		physical: { score: 78, delta: 2, weight: 25 },
		mental: { score: 70, delta: 0, weight: 45 },
		sleep: { score: 72, delta: 1, weight: 30 },
	},
	{
		id: "9",
		name: "Patient 9",
		weeksPP: 3,
		score: 41,
		scoreDelta: -8,
		trend: [56, 52, 50, 47, 44, 42, 41],
		lastCheckIn: "Today, 6:58 AM",
		status: "flagged",
		flags: 3,
		deliveryType: "C-Section",
		feedingMethod: "Combo",
		returnToWork: "May 28, 2026",
		physical: { score: 45, delta: -6, weight: 25 },
		mental: { score: 35, delta: -10, weight: 45 },
		sleep: { score: 44, delta: -5, weight: 30 },
	},
	{
		id: "12",
		name: "Patient 12",
		weeksPP: 6,
		score: 77,
		scoreDelta: 6,
		trend: [68, 70, 72, 73, 75, 76, 77],
		lastCheckIn: "Today, 10:22 AM",
		status: "on-track",
		flags: 0,
		deliveryType: "Vaginal",
		feedingMethod: "Breast",
		returnToWork: "May 1, 2026",
		physical: { score: 80, delta: 4, weight: 25 },
		mental: { score: 75, delta: 7, weight: 45 },
		sleep: { score: 78, delta: 5, weight: 30 },
	},
];

export interface DailyCheckIn {
	patientName: string;
	score: number;
	scoreDelta: number;
	status: PatientStatus;
	note: string;
}

export const dailyCheckIns: DailyCheckIn[] = [
	{
		patientName: "Patient 3",
		score: 38,
		scoreDelta: -12,
		status: "flagged",
		note: "Mood continuing to decline. Sleep quality dropped to 2/5. PPD flag triggered.",
	},
	{
		patientName: "Patient 9",
		score: 41,
		scoreDelta: -8,
		status: "flagged",
		note: "Both mood and sleep declining simultaneously for 5+ days. Needs immediate attention.",
	},
	{
		patientName: "Patient 5",
		score: 56,
		scoreDelta: -3,
		status: "watch",
		note: "Slight dip in physical recovery. Pain at incision site noted. Fatigue up.",
	},
	{
		patientName: "Patient 1",
		score: 82,
		scoreDelta: 4,
		status: "on-track",
		note: "Steady improvement across all domains. Day 3 streak of good sleep.",
	},
	{
		patientName: "Patient 7",
		score: 73,
		scoreDelta: 1,
		status: "on-track",
		note: "On track. Mild anxiety around return-to-work date but scores stable.",
	},
];

export const clinicalNotes = {
	priorityPatients:
		"Patient 3 requires immediate attention. Mood scores at 1–2/5 for four consecutive days with concurrent sleep decline. Pattern consistent with PPD onset. Recommend EPDS screening and 15-min phone check-in today.",
	coDeclineAlert:
		"Patient 9 showing mood + sleep co-decline for 5+ days. At 3 weeks PP, mental health weight is elevated (45%). Score trajectory suggests worsening without intervention.",
	panelTrend:
		"18 of 24 patients checked in. Panel average stable at 71 (+1.2). 6 patients have not checked in today — 2 missed 2+ consecutive days. 75% of panel is on track.",
};
