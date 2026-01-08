import { useRef, useLayoutEffect } from "react";

/**
 * Returns a ref that always contains the latest value.
 * Useful for accessing current values in callbacks without
 * adding them to dependency arrays (avoiding stale closures).
 *
 * @example
 * const optionsRef = useLatest(options);
 * const send = useCallback(() => {
 *   optionsRef.current.onSuccess?.(); // Always fresh
 * }, []); // Stable identity
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
