import { type CalendarEvent, getMockEvents } from "./calendar-mock";

const GOOGLE_CALENDAR_API =
	"https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface CalendarResult {
	events: CalendarEvent[];
	isLive: boolean;
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
): Promise<CalendarResult> {
	if (!token) {
		return { events: getMockEvents(withinHours), isLive: false };
	}

	try {
		const now = new Date();
		const cutoff = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

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
			return { events: getMockEvents(withinHours), isLive: false };
		}

		if (!response.ok) {
			console.warn(`[Calendar] Google API returned ${response.status}`);
			return { events: getMockEvents(withinHours), isLive: false };
		}

		const data = (await response.json()) as { items?: GoogleCalendarItem[] };
		const events = (data.items ?? [])
			.map(mapGoogleEvent)
			.filter((e) => e.start && e.end);

		return { events, isLive: true };
	} catch (err) {
		console.warn("[Calendar] fetch failed, falling back to mock:", err);
		return { events: getMockEvents(withinHours), isLive: false };
	}
}
