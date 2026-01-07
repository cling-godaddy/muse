import { Hono } from "hono";
import { createSitesTable, type SitesTable } from "@muse/db";
import { createSite, createPage, addPage, type Site, type Section } from "@muse/core";
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
  const { name, description, location, siteType } = await c.req.json() as {
    name?: string
    description?: string
    location?: string
    siteType?: "landing" | "full"
  };

  let site = createSite({
    name: name ?? "Untitled Site",
    description,
    location,
    siteType: siteType ?? "landing",
  });
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
  return c.body(null, 204);
});

// PATCH /sites/:siteId/sections/:sectionId - Update a specific section
sitesRoute.patch("/:siteId/sections/:sectionId", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const siteId = c.req.param("siteId");
  const sectionId = c.req.param("sectionId");
  const updates = await c.req.json() as Partial<Section>;

  // Get site and verify ownership
  const site = await sites.getByIdForUser(siteId, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  // Find and update the section in any page
  let foundSection: Section | null = null;
  let foundPageId: string | null = null;

  for (const [pageId, page] of Object.entries(site.pages)) {
    const sectionIndex = page.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      foundPageId = pageId;
      const sectionToUpdate = page.sections[sectionIndex];
      if (sectionToUpdate) {
        foundSection = { ...sectionToUpdate, ...updates } as Section;
        const updatedSection = foundSection;

        // Update the section in the site
        site.pages[pageId] = {
          ...page,
          sections: page.sections.map(s =>
            s.id === sectionId ? updatedSection : s,
          ),
        };
      }
      break;
    }
  }

  if (!foundSection) {
    return c.json({ error: "Section not found" }, 404);
  }

  // Save updated site
  site.updatedAt = new Date().toISOString();
  await sites.save(site, userId);

  return c.json({ section: foundSection, pageId: foundPageId });
});

// For testing: reset the cached sites table
export function resetSitesRoute(): void {
  sitesTable = null;
}
