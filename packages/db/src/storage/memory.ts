import type { Storage } from "./types";

export function createMemoryStorage(): Storage {
  const tables = new Map<string, Map<string, unknown>>();

  function getTable(name: string): Map<string, unknown> {
    let table = tables.get(name);
    if (!table) {
      table = new Map();
      tables.set(name, table);
    }
    return table;
  }

  function keyToString(key: Record<string, string>): string {
    return Object.values(key).join("#");
  }

  return {
    async get<T>(table: string, key: Record<string, string>): Promise<T | null> {
      const t = getTable(table);
      const item = t.get(keyToString(key));
      return (item as T) ?? null;
    },

    async put(table: string, item: unknown): Promise<void> {
      const t = getTable(table);
      const record = item as Record<string, unknown>;
      // Assume 'id' is the primary key - matches our DynamoDB table design
      const key = record.id as string;
      t.set(key, structuredClone(record));
    },

    async delete(table: string, key: Record<string, string>): Promise<void> {
      const t = getTable(table);
      t.delete(keyToString(key));
    },
  };
}
