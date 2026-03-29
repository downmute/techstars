import { Redirect } from "expo-router";

import { useAppStore } from "@/state/app-state";

export default function OnboardingIndexScreen() {
	const onboardingComplete = useAppStore((s) => s.onboardingComplete);
	const userName = useAppStore((s) => s.userName);

	if (onboardingComplete && userName?.trim()) {
		return <Redirect href="/onboarding/first-conversation" />;
	}

	return <Redirect href="/onboarding/welcome" />;
}
