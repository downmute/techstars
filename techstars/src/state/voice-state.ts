import { create } from "zustand";

interface VoiceStore {
	amplitude: number; // 0-1, driven by TTS playback
	isRecording: boolean;
	isSpeaking: boolean;
	setAmplitude: (a: number) => void;
	setIsRecording: (v: boolean) => void;
	setIsSpeaking: (v: boolean) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
	amplitude: 0,
	isRecording: false,
	isSpeaking: false,
	setAmplitude: (amplitude) => set({ amplitude }),
	setIsRecording: (isRecording) => set({ isRecording }),
	setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
}));
