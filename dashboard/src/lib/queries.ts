import type { PatientStatus } from "./mock-data";
import { createClient } from "./supabase/server";

export interface PanelPatient {
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

function deriveStatus(
	score: number | null,
	activeFlags: number,
): PatientStatus {
	if (activeFlags > 0 || (score !== null && score < 50)) return "flagged";
	if (score !== null && score < 70) return "watch";
	return "on-track";
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "No check-in";
	const d = new Date(`${dateStr}T00:00:00`);
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const yesterday = new Date(now.getTime() - 86400000)
		.toISOString()
		.slice(0, 10);

	if (dateStr === today) return "Today";
	if (dateStr === yesterday) return "Yesterday";
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFeedingMethod(raw: string | null): string {
	if (!raw) return "—";
	const map: Record<string, string> = {
		breastfeeding: "Breast",
		formula: "Formula",
		mixed: "Combo",
	};
	return map[raw] ?? raw;
}

function capitalize(s: string | null): string {
	if (!s) return "—";
	return s.charAt(0).toUpperCase() + s.slice(1).replace("-", "-");
}

export async function getPatientPanel(): Promise<PanelPatient[]> {
	const supabase = await createClient();

	const { data: panelRows, error } = await supabase.rpc("get_patient_panel");
	if (error || !panelRows) {
		console.warn("[queries] get_patient_panel failed:", error?.message);
		return [];
	}

	const patients: PanelPatient[] = [];

	for (let i = 0; i < panelRows.length; i++) {
		const row = panelRows[i];
		const score = row.overall_score ? Number(row.overall_score) : 0;
		const flags = Number(row.active_flags ?? 0);

		const { data: trendRows } = await supabase.rpc("get_patient_trend", {
			p_patient_id: row.patient_id,
			p_limit: 7,
		});

		const trend = (trendRows ?? [])
			.reverse()
			.map((t: { overall_score: number }) => Number(t.overall_score));

		const scoreDelta =
			trend.length >= 2 ? trend[trend.length - 1] - trend[0] : 0;

		patients.push({
			id: row.patient_id,
			name: `Patient ${i + 1}`,
			weeksPP: row.weeks_postpartum ?? 0,
			score,
			scoreDelta: Math.round(scoreDelta),
			trend: trend.length > 0 ? trend : [score],
			lastCheckIn: formatDate(row.score_date),
			status: deriveStatus(row.overall_score ? score : null, flags),
			flags,
			deliveryType: capitalize(row.delivery_type),
			feedingMethod: formatFeedingMethod(row.feeding_method),
			returnToWork: row.return_to_work_date
				? new Date(`${row.return_to_work_date}T00:00:00`).toLocaleDateString(
						"en-US",
						{ month: "short", day: "numeric", year: "numeric" },
					)
				: "—",
			physical: row.physical_score
				? { score: Number(row.physical_score), delta: 0, weight: 25 }
				: undefined,
			mental: row.mental_score
				? { score: Number(row.mental_score), delta: 0, weight: 45 }
				: undefined,
			sleep: row.sleep_score
				? { score: Number(row.sleep_score), delta: 0, weight: 30 }
				: undefined,
		});
	}

	return patients;
}

export interface PatientDetail {
	id: string;
	name: string;
	weeksPP: number;
	score: number;
	lastCheckIn: string;
	status: PatientStatus;
	flags: number;
	deliveryType: string;
	feedingMethod: string;
	returnToWork: string;
	physical: { score: number; delta: number; weight: number };
	mental: { score: number; delta: number; weight: number };
	sleep: { score: number; delta: number; weight: number };
	flagList: {
		id: string;
		type: string;
		severity: string;
		reason: string;
		differential: string | null;
		suggestedAction: string | null;
		createdAt: string;
	}[];
	trend: number[];
}

export async function getPatientDetail(
	patientId: string,
	displayIndex: number,
): Promise<PatientDetail | null> {
	const supabase = await createClient();

	const { data: rows, error } = await supabase.rpc("get_patient_detail", {
		p_patient_id: patientId,
	});
	if (error || !rows || rows.length === 0) {
		console.warn("[queries] get_patient_detail failed:", error?.message);
		return null;
	}

	const first = rows[0];
	const score = first.overall_score ? Number(first.overall_score) : 0;
	const flags = Number(first.active_flags ?? 0);

	const seen = new Set<string>();
	const flagList = rows
		.filter((r: { flag_id: string | null }) => {
			if (!r.flag_id || seen.has(r.flag_id)) return false;
			seen.add(r.flag_id);
			return true;
		})
		.map(
			(r: {
				flag_id: string;
				flag_type: string;
				flag_severity: string;
				flag_reason: string;
				flag_differential: string | null;
				flag_suggested_action: string | null;
				flag_created_at: string;
			}) => ({
				id: r.flag_id,
				type: r.flag_type,
				severity: r.flag_severity,
				reason: r.flag_reason,
				differential: r.flag_differential,
				suggestedAction: r.flag_suggested_action,
				createdAt: r.flag_created_at,
			}),
		);

	const { data: trendRows } = await supabase.rpc("get_patient_trend", {
		p_patient_id: patientId,
		p_limit: 30,
	});
	const trend = (trendRows ?? [])
		.reverse()
		.map((t: { overall_score: number }) => Number(t.overall_score));

	return {
		id: patientId,
		name: `Patient ${displayIndex}`,
		weeksPP: first.weeks_postpartum ?? 0,
		score,
		lastCheckIn: formatDate(first.score_date),
		status: deriveStatus(first.overall_score ? score : null, flags),
		flags,
		deliveryType: capitalize(first.delivery_type),
		feedingMethod: formatFeedingMethod(first.feeding_method),
		returnToWork: first.return_to_work_date
			? new Date(`${first.return_to_work_date}T00:00:00`).toLocaleDateString(
					"en-US",
					{
						month: "short",
						day: "numeric",
						year: "numeric",
					},
				)
			: "—",
		physical: {
			score: first.physical_score ? Number(first.physical_score) : 0,
			delta: 0,
			weight: 25,
		},
		mental: {
			score: first.mental_score ? Number(first.mental_score) : 0,
			delta: 0,
			weight: 45,
		},
		sleep: {
			score: first.sleep_score ? Number(first.sleep_score) : 0,
			delta: 0,
			weight: 30,
		},
		flagList,
		trend: trend.length > 0 ? trend : [score],
	};
}

export interface PanelStats {
	totalPatients: number;
	activeFlags: number;
	highSeverityFlags: number;
	avgScore: number;
	avgScoreDelta: number;
}

export function computeStats(patients: PanelPatient[]): PanelStats {
	const totalPatients = patients.length;
	const activeFlags = patients.reduce((sum, p) => sum + p.flags, 0);
	const scores = patients.filter((p) => p.score > 0).map((p) => p.score);
	const avgScore =
		scores.length > 0
			? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
			: 0;

	return {
		totalPatients,
		activeFlags,
		highSeverityFlags: patients.filter(
			(p) => p.status === "flagged" && p.flags > 0,
		).length,
		avgScore,
		avgScoreDelta: 0,
	};
}

export interface ClinicalSummaryEntry {
	date: string;
	clinicalSummary: string;
}

export async function getPatientClinicalSummaries(
	patientId: string,
	limit = 7,
): Promise<ClinicalSummaryEntry[]> {
	const supabase = await createClient();

	const { data, error } = await supabase.rpc("get_patient_clinical_summaries", {
		p_patient_id: patientId,
		p_limit: limit,
	});

	if (error || !data) {
		console.warn(
			"[queries] get_patient_clinical_summaries failed:",
			error?.message,
		);
		return [];
	}

	return (data as { summary_date: string; clinical_summary: string }[]).map(
		(row) => ({
			date: row.summary_date,
			clinicalSummary: row.clinical_summary,
		}),
	);
}

export interface DailySummaryCheckIn {
	patientId: string;
	patientName: string;
	weeksPP: number;
	score: number;
	scoreDelta: number;
	status: PatientStatus;
	clinicalSummary: string | null;
	flags: number;
}

export interface DailySummaryStats {
	checkInsToday: number;
	totalPatients: number;
	flaggedToday: number;
	avgScore: number;
	avgScoreDelta: number;
	missedCheckIns: number;
}

export async function getDailySummaryPanel(
	date: string,
): Promise<{ checkIns: DailySummaryCheckIn[]; stats: DailySummaryStats }> {
	const supabase = await createClient();

	const { data: panelRows } = await supabase.rpc("get_patient_panel");
	const totalPatients = panelRows?.length ?? 0;

	const { data, error } = await supabase.rpc("get_daily_summary_panel", {
		p_date: date,
	});

	if (error || !data) {
		console.warn("[queries] get_daily_summary_panel failed:", error?.message);
		return {
			checkIns: [],
			stats: {
				checkInsToday: 0,
				totalPatients,
				flaggedToday: 0,
				avgScore: 0,
				avgScoreDelta: 0,
				missedCheckIns: totalPatients,
			},
		};
	}

	const patientIndex = new Map<string, number>();
	if (panelRows) {
		for (let i = 0; i < panelRows.length; i++) {
			patientIndex.set(panelRows[i].patient_id as string, i + 1);
		}
	}

	const checkIns: DailySummaryCheckIn[] = (
		data as {
			patient_id: string;
			weeks_postpartum: number;
			overall_score: number;
			score_delta: number;
			clinical_summary: string | null;
			active_flags: number;
		}[]
	).map((row) => {
		const score = row.overall_score ? Number(row.overall_score) : 0;
		const flags = Number(row.active_flags ?? 0);
		const idx = patientIndex.get(row.patient_id) ?? 0;
		return {
			patientId: row.patient_id,
			patientName: `Patient ${idx}`,
			weeksPP: row.weeks_postpartum ?? 0,
			score,
			scoreDelta: Math.round(Number(row.score_delta ?? 0)),
			status: deriveStatus(score, flags),
			clinicalSummary: row.clinical_summary,
			flags,
		};
	});

	const scores = checkIns.filter((c) => c.score > 0).map((c) => c.score);
	const avgScore =
		scores.length > 0
			? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
			: 0;
	const deltas = checkIns.map((c) => c.scoreDelta);
	const avgDelta =
		deltas.length > 0
			? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) /
				10
			: 0;

	return {
		checkIns,
		stats: {
			checkInsToday: checkIns.length,
			totalPatients,
			flaggedToday: checkIns.filter((c) => c.status === "flagged").length,
			avgScore,
			avgScoreDelta: avgDelta,
			missedCheckIns: totalPatients - checkIns.length,
		},
	};
}

export interface WeeklyPatientSummary {
	patientId: string;
	patientName: string;
	weeksPP: number;
	checkInCount: number;
	avgScore: number;
	latestScore: number;
	scoreDelta: number;
	flagCount: number;
	latestClinicalSummary: string | null;
	latestFlagReason: string | null;
	latestFlagSeverity: string | null;
	hasCheckIns: boolean;
}

export interface WeeklyStats {
	totalPatients: number;
	avgScore: number;
	avgScoreDelta: number;
	totalFlags: number;
	checkInRate: number;
	scoreDistribution: { range: string; count: number }[];
}

export async function getWeeklySummary(
	startDate: string,
	endDate: string,
): Promise<{ patients: WeeklyPatientSummary[]; stats: WeeklyStats }> {
	const supabase = await createClient();

	const { data: panelRows } = await supabase.rpc("get_patient_panel");
	const patientIndex = new Map<string, number>();
	if (panelRows) {
		for (let i = 0; i < panelRows.length; i++) {
			patientIndex.set(panelRows[i].patient_id as string, i + 1);
		}
	}

	const { data, error } = await supabase.rpc("get_weekly_summary", {
		p_start_date: startDate,
		p_end_date: endDate,
	});

	if (error || !data) {
		console.warn("[queries] get_weekly_summary failed:", error?.message);
		return {
			patients: [],
			stats: {
				totalPatients: patientIndex.size,
				avgScore: 0,
				avgScoreDelta: 0,
				totalFlags: 0,
				checkInRate: 0,
				scoreDistribution: [],
			},
		};
	}

	const totalDays = Math.max(
		1,
		Math.ceil(
			(new Date(`${endDate}T00:00:00`).getTime() -
				new Date(`${startDate}T00:00:00`).getTime()) /
				86400000,
		) + 1,
	);

	const patients: WeeklyPatientSummary[] = (
		data as {
			patient_id: string;
			weeks_postpartum: number;
			check_in_count: number;
			avg_score: number;
			latest_score: number;
			score_delta: number;
			flag_count: number;
			latest_clinical_summary: string | null;
			latest_flag_reason: string | null;
			latest_flag_severity: string | null;
		}[]
	).map((row) => {
		const idx = patientIndex.get(row.patient_id) ?? 0;
		const checkIns = Number(row.check_in_count ?? 0);
		return {
			patientId: row.patient_id,
			patientName: `Patient ${idx}`,
			weeksPP: row.weeks_postpartum ?? 0,
			checkInCount: checkIns,
			avgScore: Math.round(Number(row.avg_score ?? 0)),
			latestScore: checkIns > 0 ? Math.round(Number(row.latest_score ?? 0)) : 0,
			scoreDelta: checkIns > 0 ? Math.round(Number(row.score_delta ?? 0)) : 0,
			flagCount: Number(row.flag_count ?? 0),
			latestClinicalSummary: row.latest_clinical_summary,
			latestFlagReason: row.latest_flag_reason,
			latestFlagSeverity: row.latest_flag_severity,
			hasCheckIns: checkIns > 0,
		};
	});

	const totalPatients = patients.length;
	const scores = patients
		.filter((p) => p.latestScore > 0)
		.map((p) => p.latestScore);
	const avgScore =
		scores.length > 0
			? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
			: 0;
	const deltas = patients
		.filter((p) => p.scoreDelta !== 0)
		.map((p) => p.scoreDelta);
	const avgDelta =
		deltas.length > 0
			? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) /
				10
			: 0;
	const totalFlags = patients.reduce((sum, p) => sum + p.flagCount, 0);
	const totalCheckIns = patients.reduce((sum, p) => sum + p.checkInCount, 0);
	const maxPossible = totalPatients * totalDays;
	const checkInRate =
		maxPossible > 0 ? Math.round((totalCheckIns / maxPossible) * 100) : 0;

	const dist = [
		{ range: "80–100", count: 0 },
		{ range: "60–79", count: 0 },
		{ range: "40–59", count: 0 },
		{ range: "0–39", count: 0 },
	];
	for (const p of patients) {
		if (!p.hasCheckIns) continue;
		const s = p.latestScore;
		if (s >= 80) dist[0].count++;
		else if (s >= 60) dist[1].count++;
		else if (s >= 40) dist[2].count++;
		else dist[3].count++;
	}

	return {
		patients,
		stats: {
			totalPatients,
			avgScore,
			avgScoreDelta: avgDelta,
			totalFlags,
			checkInRate,
			scoreDistribution: dist,
		},
	};
}

export type AlertSeverity = "urgent" | "high" | "medium" | "low";

export interface AlertItem {
	id: string;
	patientId: string;
	patientName: string;
	type: string;
	severity: AlertSeverity;
	reason: string;
	differential: string | null;
	suggestedAction: string | null;
	createdAt: string;
	resolvedAt: string | null;
	weeksPP: number;
	score: number;
}

export interface AlertStats {
	total: number;
	urgent: number;
	high: number;
	medium: number;
	low: number;
	resolved: number;
}

export async function getAlertsPanel(
	includeResolved = true,
): Promise<{ alerts: AlertItem[]; stats: AlertStats }> {
	const supabase = await createClient();

	const { data: panelRows } = await supabase.rpc("get_patient_panel");
	const patientIndex = new Map<string, number>();
	if (panelRows) {
		for (let i = 0; i < panelRows.length; i++) {
			patientIndex.set(panelRows[i].patient_id as string, i + 1);
		}
	}

	const { data, error } = await supabase.rpc("get_alerts_panel", {
		p_include_resolved: includeResolved,
	});

	if (error || !data) {
		console.warn("[queries] get_alerts_panel failed:", error?.message);
		return {
			alerts: [],
			stats: { total: 0, urgent: 0, high: 0, medium: 0, low: 0, resolved: 0 },
		};
	}

	const alerts: AlertItem[] = (
		data as {
			flag_id: string;
			patient_id: string;
			flag_type: string;
			flag_severity: string;
			flag_reason: string;
			flag_differential: string | null;
			flag_suggested_action: string | null;
			flag_created_at: string;
			flag_resolved_at: string | null;
			weeks_postpartum: number;
			overall_score: number | null;
		}[]
	).map((row) => {
		const idx = patientIndex.get(row.patient_id);
		return {
			id: row.flag_id,
			patientId: row.patient_id,
			patientName: idx ? `Patient ${idx}` : "Unknown Patient",
			type: row.flag_type,
			severity: row.flag_severity as AlertSeverity,
			reason: row.flag_reason,
			differential: row.flag_differential,
			suggestedAction: row.flag_suggested_action,
			createdAt: row.flag_created_at,
			resolvedAt: row.flag_resolved_at,
			weeksPP: row.weeks_postpartum ?? 0,
			score: row.overall_score ? Math.round(Number(row.overall_score)) : 0,
		};
	});

	const active = alerts.filter((a) => !a.resolvedAt);
	const stats: AlertStats = {
		total: active.length,
		urgent: active.filter((a) => a.severity === "urgent").length,
		high: active.filter((a) => a.severity === "high").length,
		medium: active.filter((a) => a.severity === "medium").length,
		low: active.filter((a) => a.severity === "low").length,
		resolved: alerts.filter((a) => a.resolvedAt).length,
	};

	return { alerts, stats };
}
