import { useRef, useLayoutEffect } from "react";

/**
 * Returns a ref that always contains the latest value.
 * Useful for accessing current values in callbacks without
 * adding them to dependency arrays (avoids stale closures).
 *
 * @example
 * const optionsRef = useLatest(options);
 * const handler = useCallback(() => {
 *   optionsRef.current.onComplete?.();
 * }, []);
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
