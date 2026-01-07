import { describe, it, expect } from "vitest";
import { createTestSite, setupTestApp } from "../_fixtures";

describe("PATCH /api/sites/:siteId/sections/:sectionId", () => {
  const getApp = setupTestApp();

  it("updates a section and returns it", async () => {
    const app = getApp();

    // Create a site with a page and section
    const sectionId = crypto.randomUUID();
    const pageId = crypto.randomUUID();
    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [
            {
              id: sectionId,
              type: "hero" as const,
              preset: "hero-centered",
              headline: "Original Headline",
              subheadline: "Original Subheadline",
            },
          ],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Update the section
    const res = await app.request(`/api/sites/${site.id}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: "Updated Headline" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.section.headline).toBe("Updated Headline");
    expect(body.section.subheadline).toBe("Original Subheadline");
    expect(body.pageId).toBe(pageId);

    // Verify the change persisted
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.pages[pageId].sections[0].headline).toBe("Updated Headline");
  });

  it("returns 404 for non-existent site", async () => {
    const app = getApp();

    const res = await app.request("/api/sites/non-existent/sections/some-section", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: "Test" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("updates backgroundColor", async () => {
    const app = getApp();

    const sectionId = crypto.randomUUID();
    const pageId = crypto.randomUUID();
    const site = createTestSite({
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          meta: { title: "Home" },
          sections: [
            {
              id: sectionId,
              type: "hero" as const,
              headline: "Test",
            },
          ],
        },
      },
      tree: [{ pageId, slug: "/", children: [] }],
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundColor: "#ff5500" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.section.backgroundColor).toBe("#ff5500");

    // Verify persistence
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.pages[pageId].sections[0].backgroundColor).toBe("#ff5500");
  });

  it("returns 404 for non-existent section", async () => {
    const app = getApp();
    const site = createTestSite();

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const res = await app.request(`/api/sites/${site.id}/sections/non-existent`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline: "Test" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Section not found");
  });
});
