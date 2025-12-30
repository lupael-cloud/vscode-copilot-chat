# PR Title
Add suggestions helper and integrate into BaseSuggestionsPanel

## Summary
This PR adds a small helper module to centralize suggestion fetching and normalisation, and updates a minimal suggestions panel to use the helper. It provides loading / error / empty states and request cancellation.

## Files added/changed
- added: `src/suggestions/suggestionsHelper.ts`
- added/changed: `src/components/BaseSuggestionsPanel.tsx`

## Key changes
- `suggestionsHelper.ts`
  - `fetchSuggestions` wraps the network request, normalises response objects, and throws readable errors.
  - `displayText` provides a simple display formatter.

- `BaseSuggestionsPanel.tsx`
  - Uses `fetchSuggestions` for data.
  - Shows loading, error, and empty states.
  - Aborts previous requests on query change.
  - Basic keyboard accessibility (Enter / Space) and click handlers.

## Why
- Separates networking from UI, improving testability and maintainability.
- Prevents race conditions by aborting stale requests.
- Provides a small UX improvement (loading/error/empty states).

## How to test
1. Ensure your runtime exposes an API at `/api/suggestions?q=<query>&limit=<n>` or change the path in `suggestionsHelper.ts`.
2. Start the extension or web host and open the view where the suggestions panel is used.
3. Type a query and verify:
   - Loading indicator appears during fetch.
   - Results are displayed.
   - Clicking or pressing Enter triggers `onSelect`.
   - Errors appear in the error element.
   - Rapid typing does not show stale results (requests are aborted).
4. Add unit tests as needed (mock `fetch` for `fetchSuggestions`; render component with mocked API for integration).

## Notes & follow-ups
- If you use a different HTTP client (e.g., Axios) or different API route, update `suggestionsHelper.ts`.
- Consider adding per-query caching and debouncing input upstream to reduce network traffic.
- Add styling consistent with the extension's UI and confirm accessibility/focus behaviour.

## Checklist
- [ ] Run linters / formatters
- [ ] Add tests for helper and component
- [ ] Confirm API path and adjust if necessary
- [ ] Review accessibility details (focus management)
