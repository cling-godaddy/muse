import { describe, it, expect } from "vitest";
import type { Section } from "@muse/core";
import { createTestSite, setupTestApp } from "../_fixtures";

describe("DELETE /api/sites/:siteId/pages/:pageId/sections/:sectionId", () => {
  const getApp = setupTestApp();

  it("deletes a section from a page", async () => {
    const app = getApp();

    const section1 = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const section2 = { id: crypto.randomUUID(), type: "features", preset: "features-grid" } as Section;
    const section3 = { id: crypto.randomUUID(), type: "cta", preset: "cta-simple" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [section1, section2, section3],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Delete section2
    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/${section2.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBeDefined();
    expect(body.page.sections).toHaveLength(2);
    expect(body.page.sections[0]?.id).toBe(section1.id);
    expect(body.page.sections[1]?.id).toBe(section3.id);

    // Verify persistence
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.pages[pageId].sections).toHaveLength(2);
  });

  it("returns 404 when site not found", async () => {
    const app = getApp();

    const res = await app.request("/api/sites/nonexistent/pages/page1/sections/section1", {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("returns 404 when page not found", async () => {
    const app = getApp();

    const site = createTestSite();
    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/nonexistent/sections/section1`, {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Page not found");
  });

  it("returns 404 when section not found", async () => {
    const app = getApp();

    const pageId = crypto.randomUUID();
    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/nonexistent`, {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Section not found");
  });

  it("prevents deletion of navbar", async () => {
    const app = getApp();

    const navbar = { id: crypto.randomUUID(), type: "navbar", preset: "navbar-minimal" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [navbar],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/${navbar.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Cannot delete navbar");
  });

  it("prevents deletion of footer", async () => {
    const app = getApp();

    const footer = { id: crypto.randomUUID(), type: "footer", preset: "footer-simple" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [footer],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/${footer.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Cannot delete footer");
  });

  it("updates site timestamp after deletion", async () => {
    const app = getApp();

    const section = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [section],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Get timestamp after initial save
    const getRes1 = await app.request(`/api/sites/${site.id}`);
    const saved = await getRes1.json();
    const originalUpdatedAt = saved.updatedAt;

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    // Delete section
    await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/${section.id}`, {
      method: "DELETE",
    });

    // Verify timestamp changed
    const getRes2 = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes2.json();
    expect(loaded.updatedAt).not.toBe(originalUpdatedAt);
  });
});
