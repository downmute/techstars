import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface OnboardingMemories {
	hometown: string;
	favoriteThings: string;
	importantPerson: string;
}

export type DeliveryType = "vaginal" | "c-section";
export type FeedingMethod = "breast" | "formula" | "both";
export type WorkSetup =
	| "full-time-office"
	| "full-time-remote"
	| "part-time-hybrid"
	| "not-returning";

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
	supabaseUserId: string | null;

	weeksPostpartum: number | null;
	deliveryType: DeliveryType | null;
	feedingMethod: FeedingMethod | null;
	clinicCode: string | null;
	returnToWorkDate: string | null;
	workSetup: WorkSetup | null;

	setOnboardingComplete: (v: boolean) => void;
	setSupabaseUserId: (id: string | null) => void;
	setUserName: (name: string) => void;
	setOnboardingMemory: (key: keyof OnboardingMemories, value: string) => void;
	setCheckInTime: (hour: number, minute: number) => void;
	setModelsDownloaded: (v: boolean) => void;
	setGoogleAccessToken: (token: string | null) => void;
	setExpoPushToken: (token: string | null) => void;
	setNotificationsEnabled: (v: boolean) => void;

	setWeeksPostpartum: (v: number | null) => void;
	setDeliveryType: (v: DeliveryType | null) => void;
	setFeedingMethod: (v: FeedingMethod | null) => void;
	setClinicCode: (v: string | null) => void;
	setReturnToWorkDate: (v: string | null) => void;
	setWorkSetup: (v: WorkSetup | null) => void;

	resetOnboarding: () => void;
}

export const useAppStore = create<AppStore>()(
	persist(
		(set) => ({
			onboardingComplete: false,
			userName: null,
			onboardingMemories: {
				hometown: "",
				favoriteThings: "",
				importantPerson: "",
			},
			checkInHour: 9,
			checkInMinute: 0,
			modelsDownloaded: false,
			googleAccessToken: null,
			expoPushToken: null,
			notificationsEnabled: false,
			supabaseUserId: null,

			weeksPostpartum: null,
			deliveryType: null,
			feedingMethod: null,
			clinicCode: null,
			returnToWorkDate: null,
			workSetup: null,

			setOnboardingComplete: (onboardingComplete) =>
				set({ onboardingComplete }),
			setSupabaseUserId: (supabaseUserId) => set({ supabaseUserId }),
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
			setGoogleAccessToken: (googleAccessToken) => set({ googleAccessToken }),
			setExpoPushToken: (expoPushToken) => set({ expoPushToken }),
			setNotificationsEnabled: (notificationsEnabled) =>
				set({ notificationsEnabled }),

			setWeeksPostpartum: (weeksPostpartum) => set({ weeksPostpartum }),
			setDeliveryType: (deliveryType) => set({ deliveryType }),
			setFeedingMethod: (feedingMethod) => set({ feedingMethod }),
			setClinicCode: (clinicCode) => set({ clinicCode }),
			setReturnToWorkDate: (returnToWorkDate) => set({ returnToWorkDate }),
			setWorkSetup: (workSetup) => set({ workSetup }),

			resetOnboarding: () =>
				set({
					onboardingComplete: false,
					userName: null,
					onboardingMemories: {
						hometown: "",
						favoriteThings: "",
						importantPerson: "",
					},
					checkInHour: 9,
					checkInMinute: 0,
					googleAccessToken: null,
					expoPushToken: null,
					notificationsEnabled: false,
					supabaseUserId: null,
					weeksPostpartum: null,
					deliveryType: null,
					feedingMethod: null,
					clinicCode: null,
					returnToWorkDate: null,
					workSetup: null,
				}),
		}),
		{
			name: "@vela/app-state",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
