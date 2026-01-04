import { Hono } from "hono";
import { createSitesTable } from "@muse/db";
import type { Site } from "@muse/core";

export const sitesRoute = new Hono();

const sites = createSitesTable();

sitesRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const site = await sites.getById(id);

  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json(site);
});

sitesRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const site = await c.req.json() as Site;

  if (site.id !== id) {
    return c.json({ error: "ID mismatch" }, 400);
  }

  // Basic sanity checks (we trust frontend data)
  if (!site.id || !site.pages || !site.tree) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  await sites.save(site);
  return c.json({ success: true });
});

sitesRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await sites.delete(id);
  return c.json({ success: true });
});
