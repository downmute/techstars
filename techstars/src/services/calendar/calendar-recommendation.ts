import type { ChatMessage } from "@/services/llm/groq-client";
import { chatOnce } from "@/services/llm/groq-client";
import type { CalendarEvent } from "./calendar-mock";

export interface TimeGap {
	start: Date;
	end: Date;
	minutes: number;
}

const SYSTEM_PROMPT = `You are a supportive recovery coach helping a postpartum woman pace her day. Given her calendar and recovery score, suggest where she should take a break. Rules:
- 2-3 sentences max.
- Reference specific times from her calendar (e.g. "Between your 10am standup and 1pm meeting…").
- If her recovery score is low (<50), be more conservative: recommend longer breaks, suggest skipping optional meetings, emphasize rest.
- If her recovery score is moderate (50-75), suggest a walk or stretch in the best gap.
- If her recovery score is high (>75), keep it light and encouraging.
- Warm, caring tone. Never use clinical language or mention scores as numbers.
- If there are no gaps, acknowledge the packed day and suggest micro-breaks (2-min breathing between meetings).`;

/**
 * Finds gaps between sorted calendar events that are at least `minMinutes` long.
 * Scans from now until end-of-day (11:59 PM).
 */
export function findGaps(events: CalendarEvent[], minMinutes = 15): TimeGap[] {
	const now = new Date();
	const endOfDay = new Date(now);
	endOfDay.setHours(23, 59, 0, 0);

	const sorted = [...events]
		.filter((e) => new Date(e.end) > now)
		.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

	const gaps: TimeGap[] = [];
	let cursor = now;

	for (const event of sorted) {
		const eventStart = new Date(event.start);
		if (eventStart > cursor) {
			const minutes = (eventStart.getTime() - cursor.getTime()) / 60_000;
			if (minutes >= minMinutes) {
				gaps.push({
					start: new Date(cursor),
					end: eventStart,
					minutes: Math.round(minutes),
				});
			}
		}
		const eventEnd = new Date(event.end);
		if (eventEnd > cursor) {
			cursor = eventEnd;
		}
	}

	if (cursor < endOfDay) {
		const minutes = (endOfDay.getTime() - cursor.getTime()) / 60_000;
		if (minutes >= minMinutes) {
			gaps.push({
				start: new Date(cursor),
				end: endOfDay,
				minutes: Math.round(minutes),
			});
		}
	}

	return gaps;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

function buildUserPrompt(opts: {
	events: CalendarEvent[];
	recoveryScore: number | null;
	userName: string | null;
	gaps: TimeGap[];
}): string {
	const name = opts.userName?.trim()?.split(" ")[0] || "her";
	const scoreLabel =
		opts.recoveryScore !== null ? `${opts.recoveryScore}/100` : "unknown";

	const eventLines =
		opts.events.length > 0
			? opts.events
					.map((e) => {
						const start = new Date(e.start);
						const end = new Date(e.end);
						return `- ${formatTime(start)}–${formatTime(end)}: ${e.title}`;
					})
					.join("\n")
			: "No events today.";

	const gapLines =
		opts.gaps.length > 0
			? opts.gaps
					.map(
						(g) =>
							`- ${formatTime(g.start)}–${formatTime(g.end)} (${g.minutes} min free)`,
					)
					.join("\n")
			: "No gaps found.";

	return [
		`Her name is ${name}. Recovery score: ${scoreLabel}.`,
		`\nToday's calendar:\n${eventLines}`,
		`\nAvailable gaps:\n${gapLines}`,
	].join("\n");
}

/**
 * Generates a break recommendation via Groq. Returns null on failure.
 */
export async function generateCalendarRecommendation(opts: {
	events: CalendarEvent[];
	recoveryScore: number | null;
	userName: string | null;
}): Promise<{ text: string; bestGap: TimeGap | null } | null> {
	try {
		const gaps = findGaps(opts.events);
		const messages: ChatMessage[] = [
			{ role: "system", content: SYSTEM_PROMPT },
			{
				role: "user",
				content: buildUserPrompt({ ...opts, gaps }),
			},
		];
		const text = await chatOnce(messages);
		const trimmed = text.trim();
		if (!trimmed) return null;

		const bestGap = gaps.length > 0 ? gaps[0] : null;
		return { text: trimmed, bestGap };
	} catch (err) {
		console.warn("[CalendarRec] generation failed:", err);
		return null;
	}
}

/**
 * Fire-and-forget orchestrator: generates the recommendation and writes to Zustand.
 * Mirrors the pattern from daily-summary-generator.ts. Never throws.
 */
export async function generateAndStoreRecommendation(opts: {
	events: CalendarEvent[];
	recoveryScore: number | null;
	userName: string | null;
	setCalendarRecommendation: (text: string | null) => void;
	scheduleBreakNotification?: (
		title: string,
		body: string,
		fireDate: Date,
	) => void;
}): Promise<void> {
	try {
		const result = await generateCalendarRecommendation(opts);
		if (!result) return;

		opts.setCalendarRecommendation(result.text);

		if (result.bestGap && opts.scheduleBreakNotification) {
			const notifTime = new Date(result.bestGap.start.getTime() - 5 * 60_000);
			if (notifTime > new Date()) {
				opts.scheduleBreakNotification(
					"Time for a break",
					result.text,
					notifTime,
				);
			}
		}
	} catch (err) {
		console.warn("[CalendarRec] generateAndStoreRecommendation failed:", err);
	}
}
