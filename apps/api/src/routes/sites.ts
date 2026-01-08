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

const MAX_IMPORT_SIZE = 10 * 1024 * 1024; // 10MB

// Mapping from atlas page types to Muse section types
const PAGE_TYPE_TO_SECTION: Record<string, string | null> = {
  about: "about",
  contact: "contact",
  product: "products",
  home: "hero",
  faq: "faq",
  pricing: "pricing",
  testimonials: "testimonials",
  gallery: "gallery",
  // Unsupported types
  legal: null,
  unknown: null,
};

interface AtlasPage {
  classification?: { type: string }
}

function countPagesByType(pages: AtlasPage[]): Record<string, number> {
  return pages.reduce((acc, page) => {
    const type = page.classification?.type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

interface CoverageItem {
  type: string
  count: number
  mapsTo?: string
}

function calculateCoverage(pageTypes: Record<string, number>) {
  const supported: CoverageItem[] = [];
  const unsupported: CoverageItem[] = [];
  let supportedPages = 0;
  let totalPages = 0;

  for (const [type, count] of Object.entries(pageTypes)) {
    totalPages += count;
    const mapsTo = PAGE_TYPE_TO_SECTION[type];

    if (mapsTo) {
      supported.push({ type, count, mapsTo });
      supportedPages += count;
    }
    else {
      unsupported.push({ type, count });
    }
  }

  return {
    supported,
    unsupported,
    supportedPages,
    totalPages,
    coveragePercent: totalPages > 0 ? Math.round((supportedPages / totalPages) * 100) : 0,
  };
}

sitesRoute.post("/import", async (c) => {
  const contentLength = parseInt(c.req.header("content-length") || "0");
  if (contentLength > MAX_IMPORT_SIZE) {
    return c.json({ error: "File too large (max 10MB)" }, 413);
  }

  const body = await c.req.json();

  if (!body.baseUrl || !Array.isArray(body.pages)) {
    return c.json({ error: "Invalid format: expected atlas JSON with baseUrl and pages" }, 400);
  }

  const pageTypes = countPagesByType(body.pages);
  const coverage = calculateCoverage(pageTypes);

  const analysis = {
    baseUrl: body.baseUrl as string,
    pageCount: body.pages.length,
    pageTypes,
    coverage,
    crawlDuration: body.duration as number | undefined,
    crawledAt: body.completedAt as string | undefined,
  };

  console.log(`[import] Analyzed ${analysis.baseUrl}: ${analysis.pageCount} pages, ${coverage.coveragePercent}% coverage`);

  return c.json({ success: true, analysis });
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

  if (!site.id || !site.pages) {
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
  return c.json(site);
});

sitesRoute.delete("/:id", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const id = c.req.param("id");
  await sites.delete(id, userId);
  return c.body(null, 204);
});

// PATCH /sites/:id - Partial update for site fields
sitesRoute.patch("/:id", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json() as { name?: string, description?: string | null, location?: string | null, thumbnailUrl?: string | null, theme?: { palette: string, typography: string } };

  const site = await sites.getByIdForUser(id, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  await sites.updateFields(id, body);

  return c.json({ ok: true });
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

  // Find the section and its page
  let foundSection: Section | null = null;
  let foundPageId: string | null = null;

  for (const [pageId, page] of Object.entries(site.pages)) {
    const existingSection = page.sections.find(s => s.id === sectionId);
    if (existingSection) {
      foundPageId = pageId;
      foundSection = { ...existingSection, ...updates } as Section;
      break;
    }
  }

  if (!foundSection || !foundPageId) {
    return c.json({ error: "Section not found" }, 404);
  }

  // Update only the section row (not the whole site) to avoid race conditions
  await sites.updateSection(sectionId, foundSection);

  return c.json({ section: foundSection, pageId: foundPageId });
});

// PATCH /sites/:siteId/pages/:pageId - Update sections order for a page
sitesRoute.patch("/:siteId/pages/:pageId", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const siteId = c.req.param("siteId");
  const pageId = c.req.param("pageId");
  const { sections } = await c.req.json() as { sections: Section[] };

  if (!sections || !Array.isArray(sections)) {
    return c.json({ error: "sections array is required" }, 400);
  }

  // Get site and verify ownership
  const site = await sites.getByIdForUser(siteId, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  // Verify page exists
  const page = site.pages[pageId];
  if (!page) {
    return c.json({ error: "Page not found" }, 404);
  }

  // Update page sections
  site.pages[pageId] = {
    ...page,
    sections,
  };

  // Save updated site
  site.updatedAt = new Date().toISOString();
  await sites.save(site, userId);

  return c.json({ page: site.pages[pageId] });
});

// POST /sites/:siteId/pages/:pageId/sections - Add a section
sitesRoute.post("/:siteId/pages/:pageId/sections", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const siteId = c.req.param("siteId");
  const pageId = c.req.param("pageId");
  const { section, index } = await c.req.json() as { section: Section, index?: number };

  if (!section) {
    return c.json({ error: "section is required" }, 400);
  }

  // Get site and verify ownership
  const site = await sites.getByIdForUser(siteId, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  // Verify page exists
  const page = site.pages[pageId];
  if (!page) {
    return c.json({ error: "Page not found" }, 404);
  }

  // Add section at specified index or append
  const updatedSections = [...page.sections];
  if (index !== undefined && index >= 0 && index <= updatedSections.length) {
    updatedSections.splice(index, 0, section);
  }
  else {
    updatedSections.push(section);
  }

  site.pages[pageId] = {
    ...page,
    sections: updatedSections,
  };

  // Save updated site
  site.updatedAt = new Date().toISOString();
  await sites.save(site, userId);

  return c.json({ page: site.pages[pageId] }, 201);
});

// DELETE /sites/:siteId/pages/:pageId/sections/:sectionId - Delete a section
sitesRoute.delete("/:siteId/pages/:pageId/sections/:sectionId", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const siteId = c.req.param("siteId");
  const pageId = c.req.param("pageId");
  const sectionId = c.req.param("sectionId");

  // Get site and verify ownership
  const site = await sites.getByIdForUser(siteId, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  // Verify page exists
  const page = site.pages[pageId];
  if (!page) {
    return c.json({ error: "Page not found" }, 404);
  }

  // Find section
  const sectionIndex = page.sections.findIndex(s => s.id === sectionId);
  if (sectionIndex === -1) {
    return c.json({ error: "Section not found" }, 404);
  }

  // Prevent deletion of navbar and footer
  const section = page.sections[sectionIndex];
  if (!section) {
    return c.json({ error: "Section not found" }, 404);
  }

  if (section.type === "navbar") {
    return c.json({ error: "Cannot delete navbar" }, 400);
  }

  if (section.type === "footer") {
    return c.json({ error: "Cannot delete footer" }, 400);
  }

  // Remove section
  const updatedSections = page.sections.filter(s => s.id !== sectionId);
  site.pages[pageId] = {
    ...page,
    sections: updatedSections,
  };

  // Save updated site
  site.updatedAt = new Date().toISOString();
  await sites.save(site, userId);

  return c.json({ page: site.pages[pageId] });
});

// PATCH /sites/:siteId/costs - Append a cost entry
sitesRoute.patch("/:siteId/costs", async (c) => {
  const sites = await getSites();
  const userId = c.get("userId");
  const siteId = c.req.param("siteId");
  const cost = await c.req.json();

  // Verify ownership
  const site = await sites.getByIdForUser(siteId, userId);
  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  await sites.appendCost(siteId, cost);
  return c.json({ success: true });
});

// For testing: reset the cached sites table
export function resetSitesRoute(): void {
  sitesTable = null;
}
