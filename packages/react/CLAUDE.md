# @muse/react

Foundational React hooks and utilities. This package is for **primitives only**.

## What belongs here

- Low-level hooks that prevent common React pitfalls (stale closures, etc.)
- Utility hooks that are generic and reusable across any React codebase
- Hooks documented in the root CLAUDE.md as patterns to follow

**Examples:** `useLatest`, `useDebouncedCallback`, `usePrevious`, `useOnClickOutside`

## What does NOT belong here

- Domain-specific hooks (e.g., `useUserAuth`, `useSiteData`)
- Hooks that depend on app-level state (Zustand stores, React Query)
- Complex hooks that orchestrate business logic
- Components

If you're unsure, ask: "Would this hook make sense in any React project?"
If yes → it might belong here. If no → it belongs in the feature code.

## Available hooks

### `useLatest(value)`
Returns a ref that always contains the latest value. Avoids stale closures in callbacks.

```typescript
const optionsRef = useLatest(options);
const handler = useCallback(() => {
  optionsRef.current.onComplete?.();
}, []); // stable identity, always fresh options
```

### `useDebouncedCallback(callback, delay)`
Returns a debounced version of the callback.

```typescript
const handleSearch = useDebouncedCallback((query: string) => {
  fetchResults(query);
}, 300);
```
