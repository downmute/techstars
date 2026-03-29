/**
 * Voice Pipeline Orchestrator
 *
 * Full turn loop:
 *   tap → record → STT → memory fetch → system prompt → Groq LLM (+ tool calls) → TTS → idle
 *
 * Also handles the morning check-in routine with pre-scripted preamble.
 */

import { buildSystemPrompt } from '@/services/llm/system-prompt';
import { streamChat, type ChatMessage } from '@/services/llm/groq-client';
import { getTopMemories } from '@/services/memory/memory-store';
import {
  startRecording,
  stopRecording,
  cancelRecording,
} from './audio-recorder';
import { transcribe } from './stt-engine';
import { speak, stopSpeaking } from './tts-engine';

import { useOrbStore } from '@/state/orb-state';
import { useVoiceStore } from '@/state/voice-state';
import { useConversationStore } from '@/state/conversation-state';
import { useAppStore } from '@/state/app-state';

export type PipelineState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'speaking';

let currentState: PipelineState = 'idle';
let cancelRequested = false;

function getState() {
  return currentState;
}

function setState(s: PipelineState) {
  currentState = s;

  const orbStore = useOrbStore.getState();
  const voiceStore = useVoiceStore.getState();

  switch (s) {
    case 'idle':
      orbStore.setState('idle');
      voiceStore.setIsRecording(false);
      voiceStore.setIsSpeaking(false);
      voiceStore.setAmplitude(0);
      break;
    case 'recording':
      orbStore.setState('listening');
      voiceStore.setIsRecording(true);
      voiceStore.setIsSpeaking(false);
      break;
    case 'processing':
      orbStore.setState('processing');
      voiceStore.setIsRecording(false);
      break;
    case 'speaking':
      orbStore.setState('speaking');
      voiceStore.setIsSpeaking(true);
      break;
  }
}

export async function startListening(): Promise<void> {
  if (currentState !== 'idle') return;

  cancelRequested = false;
  try {
    setState('recording');
    await startRecording();
  } catch (err) {
    console.error('[VoicePipeline] startRecording failed:', err);
    setState('idle');
    useOrbStore.getState().setState('error');
    setTimeout(() => useOrbStore.getState().setState('idle'), 2000);
  }
}

export async function stopListening(): Promise<void> {
  if (currentState !== 'recording') return;

  setState('processing');

  try {
    const { uri } = await stopRecording();
    if (cancelRequested) {
      setState('idle');
      return;
    }

    await processTurn(uri);
  } catch (err) {
    console.error('[VoicePipeline] stopListening error:', err);
    setState('idle');
    useOrbStore.getState().setState('error');
    setTimeout(() => useOrbStore.getState().setState('idle'), 2000);
  }
}

export function cancelTurn(): void {
  cancelRequested = true;
  cancelRecording().catch(() => {});
  stopSpeaking();
  setState('idle');
}

async function processTurn(audioUri: string): Promise<void> {
  const { userName } = useAppStore.getState();
  const conversationStore = useConversationStore.getState();

  // STT
  let transcript: string;
  try {
    transcript = await transcribe(audioUri);
  } catch (err) {
    console.error('[VoicePipeline] STT failed:', err);
    setState('idle');
    useOrbStore.getState().setState('error');
    setTimeout(() => useOrbStore.getState().setState('idle'), 2000);
    return;
  }

  if (!transcript || transcript.trim().length === 0) {
    setState('idle');
    return;
  }

  if (cancelRequested) {
    setState('idle');
    return;
  }

  conversationStore.addMessage({ role: 'user', text: transcript });

  // Build messages for Groq
  const memories = await getTopMemories(10);
  const systemPrompt = buildSystemPrompt(userName ?? 'friend', memories);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationStore.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.text,
      })),
  ];

  // Placeholder for streaming response
  conversationStore.addMessage({ role: 'assistant', text: '' });

  let fullResponse = '';

  await streamChat(messages, {
    onToken: (token) => {
      if (cancelRequested) return;
      fullResponse += token;
      conversationStore.updateLastAssistantMessage(fullResponse);
    },
    onDone: async (text) => {
      if (cancelRequested) {
        setState('idle');
        return;
      }

      conversationStore.updateLastAssistantMessage(text);

      // TTS
      setState('speaking');
      try {
        await speak(text, (amp) => {
          useVoiceStore.getState().setAmplitude(amp);
        });
      } catch (err) {
        console.error('[VoicePipeline] TTS error:', err);
      }

      setState('idle');
    },
    onError: (err) => {
      console.error('[VoicePipeline] Groq error:', err);
      setState('idle');
      useOrbStore.getState().setState('error');
      setTimeout(() => useOrbStore.getState().setState('idle'), 2000);
    },
  });
}

// Morning check-in routine: pre-speak date/weather/calendar context, then start interactive loop
export async function runCheckIn(): Promise<void> {
  if (currentState !== 'idle') return;

  const { userName } = useAppStore.getState();
  const conversationStore = useConversationStore.getState();
  const memories = await getTopMemories(10);
  const systemPrompt = buildSystemPrompt(userName ?? 'friend', memories);

  const checkInMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content:
        "It's morning check-in time. Start by greeting me, telling me today's date, checking my calendar, and asking how I'm feeling. Keep it warm and brief.",
    },
  ];

  conversationStore.clearSession();
  conversationStore.addMessage({ role: 'assistant', text: '' });

  setState('processing');

  let fullResponse = '';

  await streamChat(checkInMessages, {
    onToken: (token) => {
      fullResponse += token;
      conversationStore.updateLastAssistantMessage(fullResponse);
    },
    onDone: async (text) => {
      conversationStore.updateLastAssistantMessage(text);
      setState('speaking');
      try {
        await speak(text, (amp) => {
          useVoiceStore.getState().setAmplitude(amp);
        });
      } catch {
        // ignore TTS errors in check-in
      }
      setState('idle');
    },
    onError: (err) => {
      console.error('[VoicePipeline] Check-in error:', err);
      setState('idle');
    },
  });
}

export { getState };
