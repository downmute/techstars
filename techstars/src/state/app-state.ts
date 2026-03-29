import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface OnboardingMemories {
  hometown: string;
  favoriteThings: string;
  importantPerson: string;
}

interface AppStore {
  onboardingComplete: boolean;
  userName: string | null;
  onboardingMemories: OnboardingMemories;
  checkInHour: number;
  checkInMinute: number;
  modelsDownloaded: boolean;
  googleAccessToken: string | null;
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  setOnboardingComplete: (v: boolean) => void;
  setUserName: (name: string) => void;
  setOnboardingMemory: (
    key: keyof OnboardingMemories,
    value: string
  ) => void;
  setCheckInTime: (hour: number, minute: number) => void;
  setModelsDownloaded: (v: boolean) => void;
  setGoogleAccessToken: (token: string | null) => void;
  setExpoPushToken: (token: string | null) => void;
  setNotificationsEnabled: (v: boolean) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      userName: null,
      onboardingMemories: {
        hometown: '',
        favoriteThings: '',
        importantPerson: '',
      },
      checkInHour: 9,
      checkInMinute: 0,
      modelsDownloaded: false,
      googleAccessToken: null,
      expoPushToken: null,
      notificationsEnabled: false,
      setOnboardingComplete: (onboardingComplete) =>
        set({ onboardingComplete }),
      setUserName: (userName) => set({ userName }),
      setOnboardingMemory: (key, value) =>
        set((state) => ({
          onboardingMemories: {
            ...state.onboardingMemories,
            [key]: value,
          },
        })),
      setCheckInTime: (checkInHour, checkInMinute) =>
        set({ checkInHour, checkInMinute }),
      setModelsDownloaded: (modelsDownloaded) => set({ modelsDownloaded }),
      setGoogleAccessToken: (googleAccessToken) =>
        set({ googleAccessToken }),
      setExpoPushToken: (expoPushToken) => set({ expoPushToken }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          userName: null,
          onboardingMemories: {
            hometown: '',
            favoriteThings: '',
            importantPerson: '',
          },
          checkInHour: 9,
          checkInMinute: 0,
          googleAccessToken: null,
          expoPushToken: null,
          notificationsEnabled: false,
        }),
    }),
    {
      name: '@vela/app-state',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
