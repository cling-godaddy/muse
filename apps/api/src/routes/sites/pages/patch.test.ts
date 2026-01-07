import { describe, it, expect } from "vitest";
import type { Section } from "@muse/core";
import { createTestSite, setupTestApp } from "../_fixtures";

describe("PATCH /api/sites/:siteId/pages/:pageId", () => {
  const getApp = setupTestApp();

  it("updates page sections order", async () => {
    const app = getApp();

    // Create a site with a page and multiple sections
    const section1 = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const section2 = { id: crypto.randomUUID(), type: "features", preset: "features-grid" } as Section;
    const section3 = { id: crypto.randomUUID(), type: "cta", preset: "cta-simple" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [section1, section2, section3],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Reorder sections: move section3 to the top
    const reorderedSections = [section3, section1, section2];
    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: reorderedSections }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page.sections).toHaveLength(3);
    expect(body.page.sections[0].id).toBe(section3.id);
    expect(body.page.sections[1].id).toBe(section1.id);
    expect(body.page.sections[2].id).toBe(section2.id);

    // Verify the change persisted
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.pages[pageId].sections[0].id).toBe(section3.id);
  });

  it("returns 404 for non-existent site", async () => {
    const app = getApp();

    const res = await app.request("/api/sites/non-existent/pages/some-page", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: [] }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("returns 404 for non-existent page", async () => {
    const app = getApp();
    const site = createTestSite();

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/non-existent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: [] }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Page not found");
  });

  it("returns 400 for missing sections array", async () => {
    const app = getApp();

    const pageId = crypto.randomUUID();
    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("sections array is required");
  });

  it("preserves section content during reorder", async () => {
    const app = getApp();

    const section1 = {
      id: crypto.randomUUID(),
      type: "hero",
      preset: "hero-centered",
      headline: "First Section",
    } as Section;
    const section2 = {
      id: crypto.randomUUID(),
      type: "features",
      preset: "features-grid",
      headline: "Second Section",
    } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [section1, section2],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Reorder sections
    const reorderedSections = [section2, section1];
    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: reorderedSections }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page.sections[0].headline).toBe("Second Section");
    expect(body.page.sections[1].headline).toBe("First Section");
  });

  it("updates site.updatedAt timestamp", async () => {
    const app = getApp();

    const section = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [section],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const originalUpdatedAt = site.updatedAt;

    // Wait a tiny bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Reorder (same section, just testing timestamp update)
    await app.request(`/api/sites/${site.id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: [section] }),
    });

    // Verify timestamp changed
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.updatedAt).not.toBe(originalUpdatedAt);
  });
});
