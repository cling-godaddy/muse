export type { Storage } from "./types";
export { createDynamoDBStorage } from "./dynamodb";
export { createMemoryStorage } from "./memory";

import type { Storage } from "./types";
import { createDynamoDBStorage } from "./dynamodb";
import { createMemoryStorage } from "./memory";

let _storage: Storage | null = null;

export function getStorage(): Storage {
  if (!_storage) {
    _storage = process.env.TESTING
      ? createMemoryStorage()
      : createDynamoDBStorage();
  }
  return _storage;
}

// For testing: reset the storage singleton
export function resetStorage(): void {
  _storage = null;
}
