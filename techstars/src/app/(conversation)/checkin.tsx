/**
 * Check-in tab screen.
 *
 * NOTE: This screen uses the STORK-grounded DailySurvey component
 * (techstars/src/components/home/daily-survey.tsx). That is the canonical
 * check-in UI going forward. Do NOT revert to the old single-question mood
 * picker. If design changes are needed, edit daily-survey.tsx directly.
 */
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { DailySurvey } from "@/components/home/daily-survey";
import { Fonts } from "@/constants/theme";
import { APP_BACKGROUND, ReEntryColors } from "@/constants/vela-colors";

export default function CheckInScreen() {
	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
				<Animated.View
					entering={FadeInDown.duration(400)}
					style={styles.header}
				>
					<Text style={styles.title}>Daily check-in</Text>
					<Text style={styles.subtitle}>Be honest — no wrong answers.</Text>
				</Animated.View>

				<DailySurvey />
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: APP_BACKGROUND,
	},
	safe: {
		flex: 1,
		paddingHorizontal: 20,
	},
	header: {
		gap: 6,
		paddingTop: 16,
		paddingBottom: 12,
	},
	title: {
		color: ReEntryColors.textPrimary,
		fontSize: 30,
		fontWeight: "700",
		fontFamily: Fonts.serif,
	},
	subtitle: {
		color: ReEntryColors.textSecondary,
		fontSize: 15,
		fontFamily: Fonts.sans,
	},
});
