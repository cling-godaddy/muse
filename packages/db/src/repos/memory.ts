import type { Site, Section } from "@muse/core";
import type { SitesTable, SiteSummary, SiteUpdatableFields, MessagesTable, StoredMessage, StoredUsage } from "./types";

interface StoredSite {
  site: Site
  userId: string
}

const store = new Map<string, StoredSite>();
const messagesStore = new Map<string, StoredMessage[]>();

export function createMemorySitesTable(): SitesTable {
  return {
    async save(site: Site, userId: string): Promise<void> {
      store.set(site.id, { site: structuredClone(site), userId });
    },

    async getById(id: string): Promise<Site | null> {
      const entry = store.get(id);
      return entry ? structuredClone(entry.site) : null;
    },

    async getByIdForUser(id: string, userId: string): Promise<Site | null> {
      const entry = store.get(id);
      if (!entry || entry.userId !== userId) return null;
      return structuredClone(entry.site);
    },

    async listByUser(userId: string): Promise<SiteSummary[]> {
      const results: SiteSummary[] = [];
      for (const entry of store.values()) {
        if (entry.userId === userId) {
          results.push({
            id: entry.site.id,
            name: entry.site.name,
            updatedAt: entry.site.updatedAt,
            pageCount: Object.keys(entry.site.pages).length,
          });
        }
      }
      return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async delete(id: string, userId: string): Promise<void> {
      const entry = store.get(id);
      if (entry && entry.userId === userId) {
        store.delete(id);
      }
    },

    async updateSection(sectionId: string, section: Section): Promise<void> {
      for (const entry of store.values()) {
        for (const page of Object.values(entry.site.pages)) {
          const index = page.sections.findIndex(s => s.id === sectionId);
          if (index !== -1) {
            page.sections[index] = structuredClone(section);
            return;
          }
        }
      }
    },

    async updateFields(siteId: string, fields: SiteUpdatableFields): Promise<void> {
      const entry = store.get(siteId);
      if (!entry) return;

      if ("name" in fields && fields.name !== undefined) {
        entry.site.name = fields.name;
      }
      if ("description" in fields) {
        entry.site.description = fields.description ?? undefined;
      }
      if ("location" in fields) {
        entry.site.location = fields.location ?? undefined;
      }
      if ("theme" in fields && fields.theme !== undefined) {
        entry.site.theme = fields.theme;
      }
      // thumbnailUrl is computed dynamically in listByUser, no need to store
      entry.site.updatedAt = new Date().toISOString();
    },

    async appendCost(siteId: string, cost: StoredUsage): Promise<void> {
      const entry = store.get(siteId);
      if (!entry) return;
      entry.site.costs = [...(entry.site.costs ?? []), structuredClone(cost)];
      entry.site.updatedAt = new Date().toISOString();
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
