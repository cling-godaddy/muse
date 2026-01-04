import type { Site } from "@muse/core";
import type { SitesTable } from "./types";

const store = new Map<string, Site>();

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

export function resetMemoryStore(): void {
  store.clear();
}
