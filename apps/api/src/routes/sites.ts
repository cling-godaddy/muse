import { Hono } from "hono";
import { createSitesTable, type SitesTable } from "@muse/db";
import type { Site } from "@muse/core";

export const sitesRoute = new Hono();

let sitesTable: SitesTable | null = null;

async function getSites(): Promise<SitesTable> {
  if (!sitesTable) {
    sitesTable = await createSitesTable();
  }
  return sitesTable;
}

sitesRoute.get("/:id", async (c) => {
  const sites = await getSites();
  const id = c.req.param("id");
  const site = await sites.getById(id);

  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json(site);
});

sitesRoute.put("/:id", async (c) => {
  const sites = await getSites();
  const id = c.req.param("id");
  const site = await c.req.json() as Site;

  if (site.id !== id) {
    return c.json({ error: "ID mismatch" }, 400);
  }

  if (!site.id || !site.pages || !site.tree) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  await sites.save(site);
  return c.json({ success: true });
});

sitesRoute.delete("/:id", async (c) => {
  const sites = await getSites();
  const id = c.req.param("id");
  await sites.delete(id);
  return c.json({ success: true });
});

// For testing: reset the cached sites table
export function resetSitesRoute(): void {
  sitesTable = null;
}
