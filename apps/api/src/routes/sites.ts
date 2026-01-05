import { Hono } from "hono";
import { createSitesTable, type SitesTable } from "@muse/db";
import { createSite, createPage, addPage, type Site } from "@muse/core";
import { requireAuth } from "../middleware/auth";

export const sitesRoute = new Hono();

sitesRoute.use("/*", requireAuth);

let sitesTable: SitesTable | null = null;

async function getSites(): Promise<SitesTable> {
  if (!sitesTable) {
    sitesTable = await createSitesTable();
  }
  return sitesTable;
}

sitesRoute.get("/", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const list = await sites.listByUser(userId);
  return c.json({ sites: list });
});

sitesRoute.post("/", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const { name } = await c.req.json() as { name?: string };

  let site = createSite(name ?? "Untitled Site");
  const page = createPage("/", { title: "Home" });
  site = addPage(site, page);

  await sites.save(site, userId);
  return c.json(site, 201);
});

sitesRoute.get("/:id", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const id = c.req.param("id");
  const site = await sites.getByIdForUser(id, userId);

  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json(site);
});

sitesRoute.put("/:id", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const id = c.req.param("id");
  const site = await c.req.json() as Site;

  if (site.id !== id) {
    return c.json({ error: "ID mismatch" }, 400);
  }

  if (!site.id || !site.pages || !site.tree) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if site exists and verify ownership
  const existing = await sites.getById(id);
  if (existing) {
    const owned = await sites.getByIdForUser(id, userId);
    if (!owned) {
      return c.json({ error: "Site not found" }, 404);
    }
  }

  await sites.save(site, userId);
  return c.json({ success: true });
});

sitesRoute.delete("/:id", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const id = c.req.param("id");
  await sites.delete(id, userId);
  return c.json({ success: true });
});

// For testing: reset the cached sites table
export function resetSitesRoute(): void {
  sitesTable = null;
}
