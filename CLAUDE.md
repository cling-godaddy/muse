# CLAUDE.md

## State Management

Stack: React Query (server), Zustand + Immer (client)

### Stale Closures in Callbacks

Callbacks passed to hooks can capture stale values. This is especially common with:
- Callbacks passed to streaming/async operations
- Event handlers created in useCallback with state dependencies

**Pattern 1: Read from store directly**
```typescript
// BAD - captures stale `draft`
const handleUsage = useCallback((usage) => {
  if (!draft) return;
  // ...
}, [draft]);

// GOOD - reads current state
const handleUsage = useCallback((usage) => {
  const draft = useSiteStore.getState().draft;
  if (!draft) return;
  // ...
}, []);
```

**Pattern 2: useLatest for options objects**
```typescript
// BAD - callbacks capture stale `options`
const send = useCallback(() => {
  options.onMessage?.(msg);
}, [options]);

// GOOD - ref always has latest
const optionsRef = useLatest(options);
const send = useCallback(() => {
  optionsRef.current.onMessage?.(msg);
}, []);
```

### When to Use Each

- **getState()**: When reading Zustand store values in callbacks
- **useLatest(options)**: When a hook receives an options object with callbacks
- **Neither needed**: When the callback is short-lived (onClick handlers that run immediately)

## Portals and Popovers

When working with portaled UI (Radix popovers, modals, etc.), watch for:

- **Event bubbling**: Portal events bubble through React tree, not DOM tree. A click inside a portal can trigger handlers on React ancestors even though it's elsewhere in the DOM.
- **Focus fights**: Contenteditables and rich text editors aggressively reclaim focus, which can interfere with inputs inside popovers.
- **Click-outside detection**: Custom outside-click handlers must account for portaled content rendered outside the parent DOM hierarchy.
- **CSS animation conflicts**: Animation `transform` values override inline `transform`. Combine them in keyframes if both are needed.
