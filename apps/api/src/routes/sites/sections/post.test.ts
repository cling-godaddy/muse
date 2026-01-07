import { describe, it, expect } from "vitest";
import type { Section } from "@muse/core";
import { createTestSite, setupTestApp } from "../_fixtures";

describe("POST /api/sites/:siteId/pages/:pageId/sections", () => {
  const getApp = setupTestApp();

  it("adds a section at specified index", async () => {
    const app = getApp();

    const section1 = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const section2 = { id: crypto.randomUUID(), type: "cta", preset: "cta-simple" } as Section;
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

    // Add new section at index 1 (between section1 and section2)
    const newSection = { id: crypto.randomUUID(), type: "features", preset: "features-grid" } as Section;
    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: newSection, index: 1 }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.page).toBeDefined();
    expect(body.page.sections).toHaveLength(3);
    expect(body.page.sections[0]?.id).toBe(section1.id);
    expect(body.page.sections[1]?.id).toBe(newSection.id);
    expect(body.page.sections[2]?.id).toBe(section2.id);
  });

  it("appends section when no index provided", async () => {
    const app = getApp();

    const section1 = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const pageId = crypto.randomUUID();

    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [section1],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const newSection = { id: crypto.randomUUID(), type: "cta", preset: "cta-simple" } as Section;
    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: newSection }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.page.sections).toHaveLength(2);
    expect(body.page.sections[1]?.id).toBe(newSection.id);
  });

  it("returns 404 when site not found", async () => {
    const app = getApp();

    const section = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const res = await app.request("/api/sites/nonexistent/pages/page1/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
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

    const section = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    const res = await app.request(`/api/sites/${site.id}/pages/nonexistent/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Page not found");
  });

  it("returns 400 when section missing", async () => {
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

    const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("section is required");
  });

  it("updates site timestamp after adding", async () => {
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

    // Get timestamp after initial save
    const getRes1 = await app.request(`/api/sites/${site.id}`);
    const saved = await getRes1.json();
    const originalUpdatedAt = saved.updatedAt;

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const section = { id: crypto.randomUUID(), type: "hero", preset: "hero-centered" } as Section;
    await app.request(`/api/sites/${site.id}/pages/${pageId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
    });

    // Verify timestamp changed
    const getRes2 = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes2.json();
    expect(loaded.updatedAt).not.toBe(originalUpdatedAt);
  });
});
