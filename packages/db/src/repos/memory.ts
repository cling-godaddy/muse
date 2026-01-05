import type { Site } from "@muse/core";
import type { SitesTable, MessagesTable, StoredMessage } from "./types";

const store = new Map<string, Site>();
const messagesStore = new Map<string, StoredMessage[]>();

export function createMemorySitesTable(): SitesTable {
  return {
    async save(site: Site): Promise<void> {
      store.set(site.id, structuredClone(site));
    },

    async getById(id: string): Promise<Site | null> {
      const site = store.get(id);
      return site ? structuredClone(site) : null;
    },

    async delete(id: string): Promise<void> {
      store.delete(id);
    },
  };
}

export function createMemoryMessagesTable(): MessagesTable {
  return {
    async save(message: StoredMessage): Promise<void> {
      const messages = messagesStore.get(message.siteId) ?? [];
      const existing = messages.findIndex(m => m.id === message.id);
      if (existing >= 0) {
        messages[existing] = structuredClone(message);
      }
      else {
        messages.push(structuredClone(message));
      }
      messagesStore.set(message.siteId, messages);
    },

    async saveBatch(messages: StoredMessage[]): Promise<void> {
      for (const message of messages) {
        await this.save(message);
      }
    },

    async getBySiteId(siteId: string): Promise<StoredMessage[]> {
      const messages = messagesStore.get(siteId) ?? [];
      return messages
        .map(m => structuredClone(m))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async deleteBySiteId(siteId: string): Promise<void> {
      messagesStore.delete(siteId);
    },
  };
}

export function resetMemoryStore(): void {
  store.clear();
  messagesStore.clear();
}
