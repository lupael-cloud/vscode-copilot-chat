// Lightweight helper for fetching and formatting suggestions.
// Adapt the API path or replace `fetch` with your project's HTTP helper if needed.

export type Suggestion = {
  id: string;
  title: string;
  description?: string;
  score?: number;
};

export type FetchSuggestionsOptions = {
  query: string;
  limit?: number;
  signal?: AbortSignal;
};

/**
 * Fetch suggestions from the suggestions API.
 * - Keep network details here so UI components stay simple.
 * - Returns an array of Suggestion or throws an Error on network/failure.
 */
export async function fetchSuggestions({
  query,
  limit = 10,
  signal,
}: FetchSuggestionsOptions): Promise<Suggestion[]> {
  if (!query || !query.trim()) return [];

  // NOTE: adjust this path to match your extension backend or API proxy.
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const resp = await fetch(`/api/suggestions?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Failed to fetch suggestions: ${resp.status} ${resp.statusText} ${text}`);
  }

  const body = await resp.json();

  if (!Array.isArray(body)) {
    throw new Error('Unexpected suggestions response format (expected array)');
  }

  return body.map((item: any, idx: number) => ({
    id: String(item.id ?? item.key ?? item.title ?? `sugg-${idx}-${Math.random().toString(36).slice(2, 8)}`),
    title: String(item.title ?? item.name ?? ''),
    description: item.description ? String(item.description) : undefined,
    score: typeof item.score === 'number' ? item.score : undefined,
  }));
}

/**
 * Lightweight formatter to create a display string for a suggestion.
 */
export function displayText(s: Suggestion): string {
  if (s.description) return `${s.title} — ${s.description}`;
  return s.title;
}