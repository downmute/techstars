import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/theme";
import { ReEntryColors } from "@/constants/vela-colors";

export default function WelcomeScreen() {
	return (
		<View style={styles.screen}>
			<View style={styles.creamArc} />

			<View style={styles.glow1} />
			<View style={styles.glow2} />
			<View style={styles.glow3} />

			<SafeAreaView style={styles.safeArea}>
				<View style={styles.content}>
					<Animated.View
						entering={FadeIn.duration(900)}
						style={styles.brandArea}
					>
						<Text style={styles.brandName}>ReEntry</Text>
						<Text style={styles.tagline}>
							Your recovery journey,{"\n"}at your own pace
						</Text>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(700).duration(500)}
						style={styles.bottomArea}
					>
						<Pressable
							style={styles.button}
							onPress={() => router.push("/onboarding/about-you")}
						>
							<Text style={styles.buttonText}>Get Started</Text>
						</Pressable>
						<Text style={styles.legalText}>
							Terms of Service · Privacy Policy
						</Text>
					</Animated.View>
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: ReEntryColors.accentSoft,
	},
	creamArc: {
		position: "absolute",
		top: -200,
		left: -80,
		right: -80,
		height: 520,
		backgroundColor: ReEntryColors.background,
		borderBottomLeftRadius: 300,
		borderBottomRightRadius: 300,
	},
	glow1: {
		position: "absolute",
		top: 120,
		left: 40,
		width: 180,
		height: 180,
		borderRadius: 90,
		backgroundColor: "rgba(232,196,184,0.35)",
	},
	glow2: {
		position: "absolute",
		top: 80,
		right: 20,
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "rgba(212,133,106,0.18)",
	},
	glow3: {
		position: "absolute",
		top: 200,
		right: 80,
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(250,247,244,0.2)",
	},
	safeArea: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: 32,
		paddingTop: 80,
		paddingBottom: 20,
	},
	brandArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	brandName: {
		fontFamily: Fonts?.serif,
		fontSize: 48,
		fontWeight: "700",
		color: ReEntryColors.textPrimary,
		letterSpacing: -0.5,
		marginBottom: 16,
	},
	tagline: {
		fontFamily: Fonts?.sans,
		fontSize: 18,
		color: ReEntryColors.textPrimary,
		textAlign: "center",
		lineHeight: 26,
		opacity: 0.75,
	},
	bottomArea: {
		alignItems: "center",
		gap: 20,
		paddingBottom: 12,
	},
	button: {
		backgroundColor: ReEntryColors.background,
		borderRadius: 999,
		paddingVertical: 18,
		paddingHorizontal: 56,
		minWidth: 220,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 3,
	},
	buttonText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.primary,
		fontSize: 17,
		fontWeight: "600",
	},
	legalText: {
		fontFamily: Fonts?.sans,
		color: ReEntryColors.textPrimary,
		fontSize: 13,
		opacity: 0.4,
	},
});
