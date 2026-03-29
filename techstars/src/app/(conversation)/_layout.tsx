import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { APP_BACKGROUND, ReEntryColors } from "@/constants/vela-colors";

type TabIconName = ComponentProps<typeof SymbolView>["name"];

function TabIcon({
	color,
	focused,
	name,
}: {
	color: string;
	focused: boolean;
	name: TabIconName;
}) {
	return (
		<View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
			<SymbolView name={name} size={22} weight="medium" tintColor={color} />
		</View>
	);
}

export default function ConversationLayout() {
	return (
		<>
			<StatusBar style="dark" />
			<Tabs
				screenOptions={{
					headerShown: false,
					sceneStyle: { backgroundColor: APP_BACKGROUND },
					tabBarActiveTintColor: ReEntryColors.primary,
					tabBarInactiveTintColor: ReEntryColors.textMuted,
					tabBarHideOnKeyboard: true,
					tabBarLabelStyle: styles.tabBarLabel,
					tabBarStyle: styles.tabBar,
					tabBarItemStyle: styles.tabBarItem,
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Home",
						tabBarIcon: ({ color, focused }) => (
							<TabIcon
								color={color}
								focused={focused}
								name={{ ios: "house.fill", android: "home", web: "home" }}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="checkin"
					options={{
						title: "Check-in",
						tabBarIcon: ({ color, focused }) => (
							<TabIcon
								color={color}
								focused={focused}
								name={{ ios: "clock", android: "schedule", web: "schedule" }}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="journal"
					options={{
						title: "Journal",
						tabBarIcon: ({ color, focused }) => (
							<TabIcon
								color={color}
								focused={focused}
								name={{ ios: "heart", android: "favorite", web: "favorite" }}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						tabBarIcon: ({ color, focused }) => (
							<TabIcon
								color={color}
								focused={focused}
								name={{
									ios: "person.fill",
									android: "person",
									web: "person",
								}}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="voice"
					options={{
						href: null,
					}}
				/>
			</Tabs>
		</>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "rgba(250,247,244,0.95)",
		borderTopWidth: 1,
		borderTopColor: "rgba(44,31,26,0.06)",
		height: Platform.select({ ios: 84, default: 64 }),
		paddingBottom: Platform.select({ ios: 20, default: 8 }),
		paddingTop: 8,
		elevation: 0,
		shadowOpacity: 0,
	},
	tabBarItem: {
		paddingVertical: 2,
	},
	tabBarLabel: {
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 0.2,
	},
	iconWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	iconWrapActive: {
		backgroundColor: "rgba(181,96,79,0.1)",
	},
});
