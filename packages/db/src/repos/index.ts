import type { SitesTable } from "./types";
import { createMemorySitesTable, resetMemoryStore } from "./memory";

export type { SitesTable };

let _sitesTable: SitesTable | null = null;

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

export function resetSitesTable(): void {
  _sitesTable = null;
  resetMemoryStore();
}
