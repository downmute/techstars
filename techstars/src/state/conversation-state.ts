import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  timestamp: number;
  toolName?: string;
}

interface ConversationStore {
  messages: Message[];
  isLogOpen: boolean;
  addMessage: (m: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (text: string) => void;
  setLogOpen: (open: boolean) => void;
  clearSession: () => void;
}

let idCounter = 0;

export const useConversationStore = create<ConversationStore>((set, get) => ({
  messages: [],
  isLogOpen: false,
  addMessage: (m) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...m, id: String(++idCounter), timestamp: Date.now() },
      ],
    })),
  updateLastAssistantMessage: (text) =>
    set((state) => {
      const msgs = [...state.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], text };
          return { messages: msgs };
        }
      }
      return {
        messages: [
          ...msgs,
          {
            id: String(++idCounter),
            role: 'assistant',
            text,
            timestamp: Date.now(),
          },
        ],
      };
    }),
  setLogOpen: (isLogOpen) => set({ isLogOpen }),
  clearSession: () => set({ messages: [] }),
}));

// Helper to get messages formatted for Groq API
export function getGroqMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));
}
