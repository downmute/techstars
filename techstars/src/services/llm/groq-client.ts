import { executeToolCall, TOOL_DEFINITIONS, type ToolCall } from './tool-handlers';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  name?: string;
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not set');
  return key;
}

async function parseSSE(
  body: ReadableStream<Uint8Array>,
  onChunk: (data: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        if (data) onChunk(data);
      }
    }
  }
}

// Core streaming chat — handles tool calls recursively
export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  depth = 0
): Promise<void> {
  if (depth > 5) {
    callbacks.onError(new Error('Too many tool call iterations'));
    return;
  }

  const key = getApiKey();
  let accumulatedText = '';
  let toolCalls: ToolCall[] = [];
  let isToolCallMode = false;
  let toolCallBuffers: Record<string, { name: string; arguments: string }> = {};

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        stream: true,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    await parseSSE(response.body, (data) => {
      let chunk: {
        choices?: {
          delta?: {
            content?: string;
            tool_calls?: {
              index: number;
              id?: string;
              function?: { name?: string; arguments?: string };
            }[];
          };
          finish_reason?: string;
        }[];
      };

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
            toolCallBuffers[tc.index] = { name: '', arguments: '' };
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
        type: 'function' as const,
        function: { name: buf.name, arguments: buf.arguments },
      }));

      // Append assistant's tool-call message
      const updatedMessages: ChatMessage[] = [
        ...messages,
        { role: 'assistant', content: '', tool_calls: toolCalls },
      ];

      // Execute each tool call
      for (const tc of toolCalls) {
        const result = await executeToolCall(tc);
        updatedMessages.push({
          role: 'tool',
          content: result,
          tool_call_id: tc.id,
          name: tc.function.name,
        });
      }

      // Recurse to get final response
      await streamChat(updatedMessages, callbacks, depth + 1);
    } else {
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 256,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? '';
}
