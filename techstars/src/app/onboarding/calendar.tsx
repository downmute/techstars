import {
	exchangeCodeAsync,
	makeRedirectUri,
	useAuthRequest,
} from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { ReEntryColors } from "@/constants/vela-colors";
import { getCalendarEvents } from "@/services/calendar/calendar-service";
import { useAppStore } from "@/state/app-state";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function getGoogleIosRedirectScheme(clientId: string): string | null {
	if (!clientId || !clientId.endsWith(".apps.googleusercontent.com")) {
		return null;
	}

	return `com.googleusercontent.apps.${clientId.replace(
		/\.apps\.googleusercontent\.com$/,
		"",
	)}`;
}

const DISCOVERY = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
};

const BENEFITS = [
	{
		title: "Morning prep",
		description: "Know what's ahead before your day starts",
	},
	{
		title: "Smart breaks",
		description: "We find gaps in your schedule for rest",
	},
	{
		title: "Weekly pacing",
		description: "Adjust recovery advice around heavy weeks",
	},
];

function ProgressDots({ current, total }: { current: number; total: number }) {
	return (
		<View style={progressStyles.row}>
			{Array.from({ length: total }).map((_, i) => (
				<View
					key={i}
					style={[
						progressStyles.dot,
						{
							backgroundColor:
								i < current
									? ReEntryColors.primary
									: ReEntryColors.surfaceRaised,
							width: i < current ? 24 : 16,
						},
					]}
				/>
			))}
		</View>
	);
}

const progressStyles = StyleSheet.create({
	row: { flexDirection: "row", gap: 6, alignItems: "center" },
	dot: { height: 4, borderRadius: 2 },
});

function BackButton() {
	return (
		<Pressable onPress={() => router.back()} style={backStyles.circle}>
			<Text style={backStyles.chevron}>‹</Text>
		</Pressable>
	);
}

const backStyles = StyleSheet.create({
	circle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: ReEntryColors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	chevron: { fontSize: 22, color: ReEntryColors.textPrimary, marginTop: -2 },
});

export default function CalendarScreen() {
	const onboardingComplete = useAppStore((s) => s.onboardingComplete);
	const googleAccessToken = useAppStore((s) => s.googleAccessToken);
	const setGoogleAccessToken = useAppStore((s) => s.setGoogleAccessToken);
	const setCalendarEvents = useAppStore((s) => s.setCalendarEvents);
	const setCalendarLastFetched = useAppStore((s) => s.setCalendarLastFetched);
	const setCalendarRecommendation = useAppStore(
		(s) => s.setCalendarRecommendation,
	);
	const [isVerifyingConnection, setIsVerifyingConnection] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const googleNativeRedirectScheme =
		getGoogleIosRedirectScheme(GOOGLE_CLIENT_ID);
	const redirectUri = makeRedirectUri({
		scheme: "vela",
		path: "oauthredirect",
		native: googleNativeRedirectScheme
			? `${googleNativeRedirectScheme}:/oauthredirect`
			: undefined,
	});

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: GOOGLE_CLIENT_ID,
			scopes: [
				"openid",
				"email",
				"https://www.googleapis.com/auth/calendar.readonly",
			],
			redirectUri,
			extraParams: {
				access_type: "offline",
				prompt: "consent",
			},
		},
		DISCOVERY,
	);

	useEffect(() => {
		let cancelled = false;

		async function verifyStoredConnection() {
			if (!googleAccessToken) {
				setIsVerifyingConnection(false);
				setStatusMessage("Google Calendar is not connected yet.");
				return;
			}

			setIsVerifyingConnection(true);
			const result = await getCalendarEvents(
				googleAccessToken,
				24,
				() => setGoogleAccessToken(null),
				{ allowMockFallback: false },
			);

			if (cancelled) {
				return;
			}

			if (result.isLive) {
				setCalendarEvents(result.events);
				setCalendarLastFetched(new Date().toISOString());
				setStatusMessage("Calendar connected and ready to use.");
			} else {
				setCalendarEvents([]);
				setCalendarLastFetched(null);
				setCalendarRecommendation(null);
				setStatusMessage(
					result.reason === "token_expired"
						? "Google Calendar needs to be reconnected."
						: "Google Calendar is not connected yet.",
				);
			}

			setIsVerifyingConnection(false);
		}

		void verifyStoredConnection();
		return () => {
			cancelled = true;
		};
	}, [
		googleAccessToken,
		setCalendarEvents,
		setCalendarLastFetched,
		setCalendarRecommendation,
		setGoogleAccessToken,
	]);

	useEffect(() => {
		let cancelled = false;

		async function finalizeGoogleAuth() {
			if (response?.type !== "success") {
				if (response?.type === "error") {
					setStatusMessage("Google Calendar sign-in failed. Please try again.");
				}
				return;
			}

			const code =
				"params" in response
					? (response.params as Record<string, string | undefined>)?.code
					: undefined;

			if (!code || !request?.codeVerifier) {
				setStatusMessage(
					"Google Calendar sign-in did not return an authorization code.",
				);
				return;
			}

			setIsVerifyingConnection(true);
			try {
				const tokenResponse = await exchangeCodeAsync(
					{
						clientId: GOOGLE_CLIENT_ID,
						code,
						redirectUri,
						extraParams: {
							code_verifier: request.codeVerifier,
						},
					},
					DISCOVERY,
				);

				if (cancelled) {
					return;
				}

				if (tokenResponse.accessToken) {
					setGoogleAccessToken(tokenResponse.accessToken);
					setStatusMessage("Calendar linked successfully.");
				} else {
					setStatusMessage(
						"Google Calendar sign-in completed, but no access token was returned.",
					);
				}
			} catch (error) {
				if (!cancelled) {
					console.warn("[Calendar] token exchange failed:", error);
					setStatusMessage(
						"Google Calendar token exchange failed. Please try again.",
					);
				}
			} finally {
				if (!cancelled) {
					setIsVerifyingConnection(false);
				}
			}
		}

		void finalizeGoogleAuth();
		return () => {
			cancelled = true;
		};
	}, [redirectUri, request?.codeVerifier, response, setGoogleAccessToken]);

	const primaryCtaLabel = useMemo(() => {
		if (isVerifyingConnection) {
			return "Checking connection...";
		}
		if (googleAccessToken) {
			return onboardingComplete ? "Back to Home" : "Continue";
		}
		return "Skip for now";
	}, [googleAccessToken, isVerifyingConnection, onboardingComplete]);

	function handleSkip() {
		if (googleAccessToken) {
			if (onboardingComplete) {
				router.replace("/(conversation)");
				return;
			}
			router.push("/onboarding/first-conversation");
			return;
		}
		router.push("/onboarding/first-conversation");
	}

	return (
		<SafeAreaView style={styles.container}>
			<Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
				<BackButton />
				<ProgressDots current={5} total={5} />
				<Text style={styles.stepLabel}>5 of 5</Text>
			</Animated.View>

			<View style={styles.content}>
				<Animated.View
					entering={FadeInDown.delay(100).duration(400)}
					style={styles.iconArea}
				>
					<Text style={styles.calIcon}>📅</Text>
				</Animated.View>

				<Animated.View entering={FadeInDown.delay(200).duration(400)}>
					<Text style={styles.title}>Your calendar</Text>
					<Text style={styles.subtitle}>
						We&apos;ll suggest breaks and pace your recovery around your
						schedule.
					</Text>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(300).duration(400)}
					style={styles.benefitsCard}
				>
					{BENEFITS.map((benefit, i) => (
						<View
							key={benefit.title}
							style={[
								styles.benefitRow,
								i < BENEFITS.length - 1 && styles.benefitRowBorder,
							]}
						>
							<Text style={styles.checkmark}>✓</Text>
							<View style={styles.benefitContent}>
								<Text style={styles.benefitTitle}>{benefit.title}</Text>
								<Text style={styles.benefitDesc}>{benefit.description}</Text>
							</View>
						</View>
					))}
				</Animated.View>

				<View style={styles.spacer} />

				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					style={styles.bottomArea}
				>
					<View style={styles.statusCard}>
						<Text style={styles.statusTitle}>
							{googleAccessToken
								? "Calendar login saved on this device"
								: "Calendar not connected yet"}
						</Text>
						<Text style={styles.statusText}>
							{googleAccessToken
								? "You should only need to reconnect if Google expires access later."
								: "Connect once to use real Google Calendar events in conversations and recommendations."}
						</Text>
						{statusMessage ? (
							<Text style={styles.statusDetail}>{statusMessage}</Text>
						) : null}
					</View>
					<Pressable
						style={[styles.connectBtn, !request && styles.btnDisabled]}
						disabled={!request}
						onPress={() => promptAsync()}
					>
						{!request ? (
							<ActivityIndicator color={ReEntryColors.white} />
						) : (
							<>
								<Text style={styles.connectCheck}>✓</Text>
								<Text style={styles.connectBtnText}>
									{googleAccessToken
										? "Reconnect Google Calendar"
										: "Connect Google Calendar"}
								</Text>
							</>
						)}
					</Pressable>
					<Pressable onPress={handleSkip} style={styles.skipBtn}>
						<Text style={styles.skipText}>{primaryCtaLabel}</Text>
					</Pressable>
				</Animated.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: ReEntryColors.background },
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 16,
		gap: 16,
	},
	stepLabel: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		color: ReEntryColors.textMuted,
		marginLeft: "auto",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	iconArea: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: ReEntryColors.surface,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	calIcon: { fontSize: 32 },
	title: {
		fontFamily: Fonts?.serif,
		fontSize: 32,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		marginBottom: 8,
	},
	subtitle: {
		fontFamily: Fonts?.sans,
		fontSize: 16,
		color: ReEntryColors.textSecondary,
		lineHeight: 22,
		marginBottom: 28,
	},
	benefitsCard: {
		backgroundColor: ReEntryColors.surface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		overflow: "hidden",
	},
	benefitRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 18,
		paddingHorizontal: 20,
		gap: 14,
	},
	benefitRowBorder: {
		borderBottomWidth: 1,
		borderBottomColor: ReEntryColors.border,
	},
	checkmark: {
		fontSize: 16,
		fontWeight: "700",
		color: ReEntryColors.success,
		marginTop: 2,
	},
	benefitContent: {
		flex: 1,
		gap: 3,
	},
	benefitTitle: {
		fontFamily: Fonts?.sans,
		fontSize: 16,
		fontWeight: "600",
		color: ReEntryColors.textPrimary,
	},
	benefitDesc: {
		fontFamily: Fonts?.sans,
		fontSize: 14,
		color: ReEntryColors.textSecondary,
		lineHeight: 20,
	},
	spacer: { flex: 1 },
	bottomArea: {
		paddingBottom: 16,
		gap: 16,
		alignItems: "center",
	},
	statusCard: {
		width: "100%",
		backgroundColor: ReEntryColors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: ReEntryColors.border,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	statusTitle: {
		fontFamily: Fonts?.sans,
		fontSize: 14,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		marginBottom: 4,
	},
	statusText: {
		fontFamily: Fonts?.sans,
		fontSize: 13,
		lineHeight: 18,
		color: ReEntryColors.textSecondary,
	},
	statusDetail: {
		marginTop: 8,
		fontFamily: Fonts?.sans,
		fontSize: 13,
		lineHeight: 18,
		color: ReEntryColors.primary,
	},
	connectBtn: {
		backgroundColor: ReEntryColors.textPrimary,
		borderRadius: 999,
		paddingVertical: 18,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 10,
		width: "100%",
	},
	btnDisabled: {
		opacity: 0.5,
	},
	connectCheck: {
		fontSize: 14,
		fontWeight: "700",
		color: ReEntryColors.white,
	},
	connectBtnText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.white,
		fontSize: 16,
		fontWeight: "600",
	},
	skipBtn: {
		paddingVertical: 12,
	},
	skipText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.textMuted,
		fontSize: 15,
	},
});
