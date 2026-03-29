import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useConversationStore } from "@/state/conversation-state";
import { LogMessage } from "./log-message";

export function LogMessageList() {
	const messages = useConversationStore((s) => s.messages);
	const listRef = useRef<FlatList>(null);

	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				listRef.current?.scrollToEnd({ animated: true });
			}, 50);
		}
	}, [messages.length]);

	if (messages.length === 0) {
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>Your conversation will appear here</Text>
			</View>
		);
	}

	return (
		<FlatList
			ref={listRef}
			data={messages.filter((m) => m.role !== "tool")}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => <LogMessage message={item} />}
			contentContainerStyle={styles.list}
			showsVerticalScrollIndicator={false}
		/>
	);
}

const styles = StyleSheet.create({
	list: {
		paddingVertical: 16,
	},
	empty: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	emptyText: {
		color: "rgba(240,238,248,0.3)",
		fontSize: 16,
		textAlign: "center",
	},
});
