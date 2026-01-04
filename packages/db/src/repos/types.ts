import type { Site } from "@muse/core";

export interface SitesTable {
  save(site: Site): Promise<void>
  getById(id: string): Promise<Site | null>
  delete(id: string): Promise<void>
}
