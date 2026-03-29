import { type CalendarEvent, getMockEvents } from "./calendar-mock";

const GOOGLE_CALENDAR_API =
	"https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface CalendarResult {
	events: CalendarEvent[];
	isLive: boolean;
	reason?: "not_connected" | "token_expired" | "fetch_failed";
}

interface CalendarFetchOptions {
	allowMockFallback?: boolean;
	rangeMode?: "withinHours" | "endOfDay";
}

interface GoogleCalendarItem {
	id?: string;
	summary?: string;
	start?: { dateTime?: string; date?: string };
	end?: { dateTime?: string; date?: string };
	location?: string;
	description?: string;
}

function mapGoogleEvent(item: GoogleCalendarItem): CalendarEvent {
	return {
		id:
			item.id ?? `gcal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		title: item.summary ?? "(No title)",
		start: item.start?.dateTime ?? item.start?.date ?? "",
		end: item.end?.dateTime ?? item.end?.date ?? "",
		location: item.location,
		description: item.description,
	};
}

/**
 * Fetches calendar events from Google Calendar API when a token is available,
 * falls back to mock data otherwise. Never throws.
 *
 * @param onTokenExpired Optional callback to clear the stored token on 401.
 */
export async function getCalendarEvents(
	token: string | null,
	withinHours = 24,
	onTokenExpired?: () => void,
	options?: CalendarFetchOptions,
): Promise<CalendarResult> {
	const allowMockFallback = options?.allowMockFallback ?? true;
	const rangeMode = options?.rangeMode ?? "withinHours";
	if (!token) {
		return allowMockFallback
			? {
					events: getMockEvents(withinHours),
					isLive: false,
					reason: "not_connected",
				}
			: { events: [], isLive: false, reason: "not_connected" };
	}

	try {
		const now = new Date();
		const cutoff =
			rangeMode === "endOfDay"
				? new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate(),
						23,
						59,
						59,
						999,
					)
				: new Date(now.getTime() + withinHours * 60 * 60 * 1000);

		const params = new URLSearchParams({
			timeMin: now.toISOString(),
			timeMax: cutoff.toISOString(),
			singleEvents: "true",
			orderBy: "startTime",
			maxResults: "10",
		});

		const response = await fetch(`${GOOGLE_CALENDAR_API}?${params}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (response.status === 401) {
			onTokenExpired?.();
			return allowMockFallback
				? {
						events: getMockEvents(withinHours),
						isLive: false,
						reason: "token_expired",
					}
				: { events: [], isLive: false, reason: "token_expired" };
		}

		if (!response.ok) {
			console.warn(`[Calendar] Google API returned ${response.status}`);
			return allowMockFallback
				? {
						events: getMockEvents(withinHours),
						isLive: false,
						reason: "fetch_failed",
					}
				: { events: [], isLive: false, reason: "fetch_failed" };
		}

		const data = (await response.json()) as { items?: GoogleCalendarItem[] };
		const events = (data.items ?? [])
			.map(mapGoogleEvent)
			.filter((e) => e.start && e.end);

		return { events, isLive: true };
	} catch (err) {
		console.warn("[Calendar] fetch failed, falling back to mock:", err);
		return allowMockFallback
			? {
					events: getMockEvents(withinHours),
					isLive: false,
					reason: "fetch_failed",
				}
			: { events: [], isLive: false, reason: "fetch_failed" };
	}
}
