import AsyncStorage from "@react-native-async-storage/async-storage";

import type { MemoryEntry } from "./memory-types";

const STORAGE_KEY = "@vela/memories";

async function readAll(): Promise<MemoryEntry[]> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as MemoryEntry[]) : [];
	} catch {
		return [];
	}
}

async function writeAll(entries: MemoryEntry[]): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function getAllMemories(): Promise<MemoryEntry[]> {
	return readAll();
}

export async function saveMemory(
	entry: Omit<MemoryEntry, "id" | "created_at" | "last_referenced">,
): Promise<MemoryEntry> {
	const entries = await readAll();
	const now = new Date().toISOString();
	const newEntry: MemoryEntry = {
		...entry,
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		created_at: now,
		last_referenced: now,
	};
	await writeAll([...entries, newEntry]);
	return newEntry;
}

export async function getTopMemories(n = 10): Promise<MemoryEntry[]> {
	const entries = await readAll();

	// Health notes always included first
	const healthNotes = entries.filter((e) => e.category === "health_note");
	const others = entries.filter((e) => e.category !== "health_note");

	// Sort others: importance DESC, then last_referenced DESC
	others.sort((a, b) => {
		if (b.importance_score !== a.importance_score) {
			return b.importance_score - a.importance_score;
		}
		return (
			new Date(b.last_referenced).getTime() -
			new Date(a.last_referenced).getTime()
		);
	});

	const combined = [...healthNotes, ...others];
	return combined.slice(0, n);
}

export async function touchMemory(id: string): Promise<void> {
	const entries = await readAll();
	const idx = entries.findIndex((e) => e.id === id);
	if (idx >= 0) {
		entries[idx] = {
			...entries[idx],
			last_referenced: new Date().toISOString(),
		};
		await writeAll(entries);
	}
}

export async function clearAllMemories(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEY);
}
