export type MemoryCategory =
	| "family"
	| "preference"
	| "health_note"
	| "life_story"
	| "recurring_topic"
	| "contact";

export type ImportanceScore = 1 | 2 | 3 | 4 | 5;

export interface MemoryEntry {
	id: string;
	user_id: string;
	category: MemoryCategory;
	content: string;
	created_at: string; // ISO 8601
	last_referenced: string; // ISO 8601
	importance_score: ImportanceScore;
}
