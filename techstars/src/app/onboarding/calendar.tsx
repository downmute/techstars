import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
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
import { useAppStore } from "@/state/app-state";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

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
	const setGoogleAccessToken = useAppStore((s) => s.setGoogleAccessToken);

	const redirectUri = makeRedirectUri({ scheme: "vela" });

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: GOOGLE_CLIENT_ID,
			scopes: [
				"openid",
				"email",
				"https://www.googleapis.com/auth/calendar.readonly",
			],
			redirectUri,
		},
		DISCOVERY,
	);

	useEffect(() => {
		if (response?.type === "success") {
			const token = response.authentication?.accessToken;
			if (token) {
				setGoogleAccessToken(token);
			}
			router.push("/onboarding/first-conversation");
		}
	}, [response, setGoogleAccessToken]);

	function handleSkip() {
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
									Connect Google Calendar
								</Text>
							</>
						)}
					</Pressable>
					<Pressable onPress={handleSkip} style={styles.skipBtn}>
						<Text style={styles.skipText}>Skip for now</Text>
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
