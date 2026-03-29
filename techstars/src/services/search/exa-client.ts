const EXA_API_URL = "https://api.exa.ai/search";

interface ExaResult {
	title: string;
	url: string;
	text?: string;
}

interface ExaSearchResponse {
	results: ExaResult[];
}

export async function exaSearch(
	query: string,
	numResults = 3,
): Promise<string> {
	const apiKey = process.env.EXPO_PUBLIC_EXA_API_KEY;
	if (!apiKey) {
		return `I'm unable to search right now — no API key configured.`;
	}

	try {
		const response = await fetch(EXA_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
			},
			body: JSON.stringify({
				query,
				numResults,
				useAutoprompt: true,
				type: "auto",
				text: true,
			}),
		});

		if (!response.ok) {
			return `I couldn't find information on that right now.`;
		}

		const data = (await response.json()) as ExaSearchResponse;
		const snippets = data.results
			.filter((r) => r.text)
			.map((r) => r.text!.slice(0, 300))
			.join("\n\n");

		return snippets || `No relevant results found for: ${query}`;
	} catch {
		return `I wasn't able to search for that. Please try again.`;
	}
}
