// Minimal suggestions panel component wired to suggestionsHelper.
// Place or adapt this component where your project expects UI components.

import React, { useEffect, useState, useRef } from 'react';
import { fetchSuggestions, displayText, Suggestion } from '../suggestions/suggestionsHelper';

type Props = {
  query: string;
  maxItems?: number;
  onSelect?: (item: Suggestion) => void;
  className?: string;
};

export default function BaseSuggestionsPanel({
  query,
  maxItems = 8,
  onSelect,
  className = '',
}: Props) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!query || !query.trim()) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    fetchSuggestions({ query, limit: maxItems, signal: controller.signal })
      .then((results) => {
        if (!mounted) return;
        setItems(results.slice(0, maxItems));
      })
      .catch((err: any) => {
        if (!mounted) return;
        if (err.name === 'AbortError') return;
        // surface a friendly message
        console.error('Suggestions fetch error', err);
        setError(err?.message ?? 'Failed to load suggestions');
        setItems([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [query, maxItems]);

  return (
    <div className={`base-suggestions-panel ${className}`} role="list" aria-live="polite">
      {loading && <div className="suggestions-loading">Loading…</div>}
      {error && <div className="suggestions-error" role="alert">{error}</div>}
      {!loading && items.length === 0 && !error && <div className="suggestions-empty">No suggestions</div>}
      <ul className="suggestions-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li
            key={it.id}
            className="suggestion-item"
            role="listitem"
            onClick={() => onSelect?.(it)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(it);
              }
            }}
            style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            title={displayText(it)}
          >
            <div className="suggestion-title" style={{ fontWeight: 500 }}>{it.title}</div>
            {it.description && <div className="suggestion-desc" style={{ fontSize: '0.9em', color: '#555' }}>{it.description}</div>}
            {typeof it.score === 'number' && <div className="suggestion-score" style={{ fontSize: '0.8em', color: '#777' }}>{it.score.toFixed(2)}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
