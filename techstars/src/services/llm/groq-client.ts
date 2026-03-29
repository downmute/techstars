import { fetch as expoFetch } from "expo/fetch";
import {
	executeToolCall,
	TOOL_DEFINITIONS,
	type ToolCall,
} from "./tool-handlers";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL =
	process.env.EXPO_PUBLIC_GROQ_MODEL?.trim() || "openai/gpt-oss-120b";
const DISABLE_GROQ_STREAMING = true;

export interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
	tool_call_id?: string;
	tool_calls?: ToolCall[];
	name?: string;
}

interface StreamCallbacks {
	onToken: (token: string) => void;
	onDone: (fullText: string) => void;
	onError: (error: Error) => void;
	onMode?: (mode: "streaming" | "non-streaming") => void;
}

interface GroqToolCallDelta {
	index: number;
	id?: string;
	function?: { name?: string; arguments?: string };
}

interface GroqResponseChunk {
	choices?: {
		delta?: {
			content?: string;
			tool_calls?: GroqToolCallDelta[];
		};
		finish_reason?: string;
		message?: {
			content?: string | null;
			tool_calls?: ToolCall[];
		};
	}[];
}

interface StructuredOutputRequest {
	model?: string;
	messages: ChatMessage[];
	schemaName: string;
	schema: Record<string, unknown>;
	strict?: boolean;
	maxCompletionTokens?: number;
	temperature?: number;
}

function getApiKey(): string {
	const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
	if (!key) throw new Error("EXPO_PUBLIC_GROQ_API_KEY is not set");
	return key;
}

async function parseSSE(
	body: ReadableStream<Uint8Array>,
	onChunk: (data: string) => void,
): Promise<void> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			if (line.startsWith("data: ")) {
				const data = line.slice(6).trim();
				if (data === "[DONE]") return;
				if (data) onChunk(data);
			}
		}
	}
}

function buildRequestBody(
	messages: ChatMessage[],
	stream: boolean,
	includeTools = true,
) {
	const baseBody = {
		model: MODEL,
		messages,
		stream,
		max_completion_tokens: 512,
		temperature: 0.7,
	};

	if (!includeTools) {
		return baseBody;
	}

	return {
		...baseBody,
		tools: TOOL_DEFINITIONS,
		tool_choice: "auto" as const,
	};
}

async function requestChatCompletion(
	key: string,
	messages: ChatMessage[],
	stream: boolean,
	includeTools = true,
) {
	return expoFetch(GROQ_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(buildRequestBody(messages, stream, includeTools)),
	});
}

async function completeChatNonStreaming(
	key: string,
	messages: ChatMessage[],
	callbacks: StreamCallbacks,
	depth: number,
	includeTools = true,
) {
	callbacks.onMode?.("non-streaming");
	const fallbackResponse = await requestChatCompletion(
		key,
		messages,
		false,
		includeTools,
	);
	if (!fallbackResponse.ok) {
		const fallbackErr = await fallbackResponse.text();
		throw new Error(`Groq API error ${fallbackResponse.status}: ${fallbackErr}`);
	}

	const payload = (await fallbackResponse.json()) as GroqResponseChunk;
	const message = payload.choices?.[0]?.message;
	const content = message?.content ?? "";
	const responseToolCalls = message?.tool_calls ?? [];
	console.log(
		`[Groq] Non-streaming reply received chars=${content.length} toolCalls=${responseToolCalls.length} includeTools=${includeTools}`,
	);

	if (responseToolCalls.length > 0) {
		const updatedMessages: ChatMessage[] = [
			...messages,
			{
				role: "assistant",
				content: content ?? "",
				tool_calls: responseToolCalls,
			},
		];

		for (const tc of responseToolCalls) {
			const result = await executeToolCall(tc);
			updatedMessages.push({
				role: "tool",
				content: result,
				tool_call_id: tc.id,
				name: tc.function.name,
			});
		}

		await streamChat(updatedMessages, callbacks, depth + 1);
		return;
	}

	if (!content.trim() && includeTools) {
		console.warn(
			"[Groq] Non-streaming reply returned empty content with tools enabled. Retrying without tools.",
		);
		await completeChatNonStreaming(key, messages, callbacks, depth, false);
		return;
	}

	callbacks.onDone(content);
}

// Core streaming chat — handles tool calls recursively
export async function streamChat(
	messages: ChatMessage[],
	callbacks: StreamCallbacks,
	depth = 0,
): Promise<void> {
	if (depth > 5) {
		callbacks.onError(new Error("Too many tool call iterations"));
		return;
	}

	const key = getApiKey();
	let accumulatedText = "";
	let toolCalls: ToolCall[] = [];
	let isToolCallMode = false;
	const toolCallBuffers: Record<string, { name: string; arguments: string }> =
		{};

	try {
		if (DISABLE_GROQ_STREAMING) {
			await completeChatNonStreaming(key, messages, callbacks, depth);
			return;
		}

		const response = await requestChatCompletion(key, messages, true);

		if (!response.ok) {
			const err = await response.text();
			throw new Error(`Groq API error ${response.status}: ${err}`);
		}

		if (!response.body) {
			const contentType = response.headers.get("content-type") ?? "unknown";
			const transferEncoding =
				response.headers.get("transfer-encoding") ?? "unknown";
			const contentLength = response.headers.get("content-length") ?? "unknown";
			const requestId =
				response.headers.get("x-request-id") ??
				response.headers.get("x-groq-request-id") ??
				"unknown";
			console.warn(
				`[Groq] Streaming response body unavailable in this runtime. Falling back to non-streaming chat completion. contentType=${contentType} transferEncoding=${transferEncoding} contentLength=${contentLength} requestId=${requestId}`,
			);
			await completeChatNonStreaming(key, messages, callbacks, depth);
			return;
		}

		callbacks.onMode?.("streaming");

		await parseSSE(response.body, (data) => {
			let chunk: GroqResponseChunk;

			try {
				chunk = JSON.parse(data);
			} catch {
				return;
			}

			const delta = chunk.choices?.[0]?.delta;
			if (!delta) return;

			// Normal text tokens
			if (delta.content) {
				accumulatedText += delta.content;
				callbacks.onToken(delta.content);
			}

			// Tool call accumulation
			if (delta.tool_calls) {
				isToolCallMode = true;
				for (const tc of delta.tool_calls) {
					if (!toolCallBuffers[tc.index]) {
						toolCallBuffers[tc.index] = { name: "", arguments: "" };
					}
					if (tc.function?.name) {
						toolCallBuffers[tc.index].name += tc.function.name;
					}
					if (tc.function?.arguments) {
						toolCallBuffers[tc.index].arguments += tc.function.arguments;
					}
					if (tc.id) {
						// Store ID alongside
						(toolCallBuffers[tc.index] as Record<string, string>).id = tc.id;
					}
				}
			}
		});

		if (isToolCallMode && Object.keys(toolCallBuffers).length > 0) {
			// Build tool call objects
			toolCalls = Object.entries(toolCallBuffers).map(([_idx, buf]) => ({
				id: (buf as Record<string, string>).id ?? `call_${_idx}`,
				type: "function" as const,
				function: { name: buf.name, arguments: buf.arguments },
			}));

			// Append assistant's tool-call message
			const updatedMessages: ChatMessage[] = [
				...messages,
				{ role: "assistant", content: "", tool_calls: toolCalls },
			];

			// Execute each tool call
			for (const tc of toolCalls) {
				const result = await executeToolCall(tc);
				updatedMessages.push({
					role: "tool",
					content: result,
					tool_call_id: tc.id,
					name: tc.function.name,
				});
			}

			// Recurse to get final response
			await streamChat(updatedMessages, callbacks, depth + 1);
		} else {
			if (!accumulatedText.trim()) {
				console.warn(
					"[Groq] Streaming reply produced no text tokens. Falling back to non-streaming chat completion.",
				);
				await completeChatNonStreaming(key, messages, callbacks, depth);
				return;
			}
			console.log(
				`[Groq] Streaming reply complete chars=${accumulatedText.length}`,
			);
			callbacks.onDone(accumulatedText);
		}
	} catch (err) {
		callbacks.onError(err instanceof Error ? err : new Error(String(err)));
	}
}

// Non-streaming version for simple single-turn calls (e.g., check-in preamble)
export async function chatOnce(messages: ChatMessage[]): Promise<string> {
	const key = getApiKey();

	const response = await fetch(GROQ_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			model: MODEL,
			messages,
			max_completion_tokens: 400,
			temperature: 0.7,
		}),
	});

	if (!response.ok) {
		throw new Error(`Groq API error ${response.status}`);
	}

	const data = (await response.json()) as {
		choices: { message: { content: string } }[];
	};
	return data.choices[0]?.message?.content ?? "";
}

export async function chatStructuredOnce<T>(
	request: StructuredOutputRequest,
): Promise<T> {
	const key = getApiKey();

	const response = await expoFetch(GROQ_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			model: request.model ?? "openai/gpt-oss-20b",
			messages: request.messages,
			max_completion_tokens: request.maxCompletionTokens ?? 500,
			temperature: request.temperature ?? 0,
			response_format: {
				type: "json_schema",
				json_schema: {
					name: request.schemaName,
					strict: request.strict ?? true,
					schema: request.schema,
				},
			},
		}),
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(`Groq structured output error ${response.status}: ${err}`);
	}

	const data = (await response.json()) as {
		choices?: { message?: { content?: string | null } }[];
	};
	const content = data.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error("Groq structured output returned no content");
	}

	return JSON.parse(content) as T;
}
