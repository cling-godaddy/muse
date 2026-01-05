import type { SitesTable, SiteSummary, MessagesTable, StoredMessage } from "./types";
import { createMemorySitesTable, createMemoryMessagesTable, resetMemoryStore } from "./memory";

export type { SitesTable, SiteSummary, MessagesTable, StoredMessage };

let _sitesTable: SitesTable | null = null;
let _messagesTable: MessagesTable | null = null;

export async function createSitesTable(): Promise<SitesTable> {
  if (!_sitesTable) {
    if (process.env.TESTING) {
      _sitesTable = createMemorySitesTable();
    }
    else {
      const { createPostgresSitesTable } = await import("./postgres");
      _sitesTable = createPostgresSitesTable();
    }
  }
  return _sitesTable;
}

export async function createMessagesTable(): Promise<MessagesTable> {
  if (!_messagesTable) {
    if (process.env.TESTING) {
      _messagesTable = createMemoryMessagesTable();
    }
    else {
      const { createPostgresMessagesTable } = await import("./postgres");
      _messagesTable = createPostgresMessagesTable();
    }
  }
  return _messagesTable;
}

export function resetSitesTable(): void {
  _sitesTable = null;
  _messagesTable = null;
  resetMemoryStore();
}
