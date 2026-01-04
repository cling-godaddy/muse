import type { Site } from "@muse/core";
import { getStorage } from "../storage";
import { TABLE_NAME } from "../table";

export interface SitesTable {
  save(site: Site): Promise<void>
  getById(id: string): Promise<Site | null>
  delete(id: string): Promise<void>
}

export function createSitesTable(): SitesTable {
  const storage = getStorage();

  return {
    async save(site: Site): Promise<void> {
      await storage.put(TABLE_NAME, site);
    },

    async getById(id: string): Promise<Site | null> {
      return storage.get<Site>(TABLE_NAME, { id });
    },

    async delete(id: string): Promise<void> {
      await storage.delete(TABLE_NAME, { id });
    },
  };
}
