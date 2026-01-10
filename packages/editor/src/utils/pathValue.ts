/**
 * Utilities for getting/setting values in objects by dot-bracket path notation.
 * e.g., "items[0].title", "headline", "quotes[2].author"
 */

/**
 * Parse a path string into an array of keys.
 * "items[0].title" → ["items", "0", "title"]
 */
function parsePath(path: string): string[] {
  return path.match(/[^.[\]]+/g) ?? [];
}

/**
 * Get a value from an object by path.
 * Returns undefined if any part of the path doesn't exist.
 */
export function getByPath(obj: unknown, path: string): unknown {
  const parts = parsePath(path);
  let current = obj;

  for (const part of parts) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a value in an object by path, returning a new object (immutable).
 * Creates intermediate objects/arrays as needed.
 */
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const parts = parsePath(path);
  if (parts.length === 0) return value as T;

  const result = structuredClone(obj);
  let current = result as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    if (part === undefined || nextPart === undefined) continue;

    if (current[part] == null) {
      // Create array if next part is numeric, otherwise object
      current[part] = /^\d+$/.test(nextPart) ? [] : {};
    }

    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart !== undefined) {
    current[lastPart] = value;
  }
  return result;
}
