import { getCalendarEvents } from "@/services/calendar/calendar-service";
import { saveMemory } from "@/services/memory/memory-store";
import type {
	ImportanceScore,
	MemoryCategory,
} from "@/services/memory/memory-types";
import { exaSearch } from "@/services/search/exa-client";
import { useAppStore } from "@/state/app-state";

export interface ToolDefinition {
	type: "function";
	function: {
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	};
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
	{
		type: "function",
		function: {
			name: "calendar_get_events",
			description:
				"Get upcoming calendar events for the user. Call this when the user asks about their schedule, appointments, or plans.",
			parameters: {
				type: "object",
				properties: {
					hours_ahead: {
						type: "number",
						description:
							"How many hours ahead to look for events. Default is 48.",
					},
				},
				required: [],
			},
		},
	},
	{
		type: "function",
		function: {
			name: "web_search",
			description:
				"Search the web for current information. Use for weather, news, sports scores, or any factual question.",
			parameters: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "The search query.",
					},
				},
				required: ["query"],
			},
		},
	},
	{
		type: "function",
		function: {
			name: "memory_write",
			description:
				"Save something important the user has shared — a family member name, a preference, a health note, or a life story. Call this when the user shares something personal that should be remembered for future conversations.",
			parameters: {
				type: "object",
				properties: {
					category: {
						type: "string",
						enum: [
							"family",
							"preference",
							"health_note",
							"life_story",
							"recurring_topic",
							"contact",
						],
						description: "The category of this memory.",
					},
					content: {
						type: "string",
						description:
							'A clear, concise statement of what to remember. Write in third person (e.g., "Margaret\'s daughter is named Sarah").',
					},
					importance_score: {
						type: "number",
						enum: [1, 2, 3, 4, 5],
						description:
							"How important is this memory? 1=minor detail, 5=critical (health notes are always 5).",
					},
				},
				required: ["category", "content", "importance_score"],
			},
		},
	},
];

export interface ToolCall {
	id: string;
	type: "function";
	function: {
		name: string;
		arguments: string;
	};
}

export async function executeToolCall(
	toolCall: ToolCall,
	userId = "demo-user",
): Promise<string> {
	const { name, arguments: argsStr } = toolCall.function;
	let args: Record<string, unknown> = {};

	try {
		args = JSON.parse(argsStr);
	} catch {
		return "Error parsing tool arguments.";
	}

	switch (name) {
		case "calendar_get_events": {
			const hoursAhead = (args.hours_ahead as number) ?? 48;
			const token = useAppStore.getState().googleAccessToken;
			const { events } = await getCalendarEvents(token, hoursAhead, () =>
				useAppStore.getState().setGoogleAccessToken(null),
			);
			if (events.length === 0) return "No upcoming events found.";
			return events
				.map((e) => {
					const start = new Date(e.start);
					const dayLabel =
						start.toDateString() === new Date().toDateString()
							? "Today"
							: "Tomorrow";
					const time = start.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
					});
					return `${dayLabel} at ${time}: ${e.title}${e.location ? ` (${e.location})` : ""}`;
				})
				.join("\n");
		}

		case "web_search": {
			const query = args.query as string;
			return exaSearch(query);
		}

		case "memory_write": {
			await saveMemory({
				user_id: userId,
				category: args.category as MemoryCategory,
				content: args.content as string,
				importance_score: args.importance_score as ImportanceScore,
			});
			return "Memory saved successfully.";
		}

		default:
			return `Unknown tool: ${name}`;
	}
}
