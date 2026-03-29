import { StyleSheet, Text, View } from "react-native";

import { Fonts } from "@/constants/theme";

interface OnboardingHeaderProps {
	title: string;
	body?: string;
	align?: "left" | "center";
}

export function OnboardingHeader({
	title,
	body,
	align = "left",
}: OnboardingHeaderProps) {
	const alignItems = align === "center" ? "center" : "flex-start";
	const textAlign = align;

	return (
		<View style={[styles.container, { alignItems }]}>
			<Text style={[styles.title, { textAlign }]}>{title}</Text>
			{body ? <Text style={[styles.body, { textAlign }]}>{body}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 8,
	},
	title: {
		color: "#2C1F1A",
		fontSize: 32,
		fontWeight: "normal",
		fontFamily: Fonts?.serif,
		lineHeight: 40,
	},
	body: {
		color: "#8A6F65",
		fontSize: 16,
		lineHeight: 24,
	},
});
