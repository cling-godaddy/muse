import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { sitesRoute, resetSitesRoute } from "./sites";
import { resetSitesTable } from "@muse/db";
import type { Site, Section } from "@muse/core";

let mockUserId = "test_user_123";

// Mock clerk auth to return configurable user
vi.mock("@hono/clerk-auth", () => ({
  getAuth: () => ({ userId: mockUserId }),
}));

function createTestSite(overrides: Partial<Site> = {}): Site {
  return {
    id: crypto.randomUUID(),
    name: "Test Site",
    pages: {},
    tree: [],
    theme: { palette: "slate", typography: "inter" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("sites routes", () => {
  let app: Hono;

  beforeEach(() => {
    mockUserId = "test_user_123";
    resetSitesTable();
    resetSitesRoute();
    app = new Hono();
    app.route("/api/sites", sitesRoute);
  });

  describe("PUT /api/sites/:id", () => {
    it("creates a new site", async () => {
      const site = createTestSite();

      const res = await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(site.id);
      expect(body.name).toBe(site.name);
    });

    it("updates an existing site", async () => {
      const site = createTestSite();

      // Create
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Update
      const updated = { ...site, name: "Updated Site" };
      const res = await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      expect(res.status).toBe(200);

      // Verify
      const getRes = await app.request(`/api/sites/${site.id}`);
      const loaded = await getRes.json();
      expect(loaded.name).toBe("Updated Site");
    });

    it("returns 400 for ID mismatch", async () => {
      const site = createTestSite();

      const res = await app.request("/api/sites/different-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("ID mismatch");
    });

    it("returns 400 for missing required fields", async () => {
      const res = await app.request("/api/sites/some-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "some-id" }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Missing required fields");
    });
  });

  describe("GET /api/sites/:id", () => {
    it("returns 404 for non-existent site", async () => {
      const res = await app.request("/api/sites/non-existent");

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Site not found");
    });

    it("returns site after creation", async () => {
      const site = createTestSite({ name: "My Site" });

      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      const res = await app.request(`/api/sites/${site.id}`);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe("My Site");
      expect(body.id).toBe(site.id);
    });
  });

  describe("DELETE /api/sites/:id", () => {
    it("deletes an existing site", async () => {
      const site = createTestSite();

      // Create
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Delete
      const deleteRes = await app.request(`/api/sites/${site.id}`, {
        method: "DELETE",
      });
      expect(deleteRes.status).toBe(204);

      // Verify gone
      const getRes = await app.request(`/api/sites/${site.id}`);
      expect(getRes.status).toBe(404);
    });

    it("succeeds even for non-existent site", async () => {
      const res = await app.request("/api/sites/non-existent", {
        method: "DELETE",
      });

      expect(res.status).toBe(204);
    });
  });

  describe("GET /api/sites", () => {
    it("returns empty list initially", async () => {
      const res = await app.request("/api/sites");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sites).toEqual([]);
    });

    it("returns user's sites", async () => {
      const site = createTestSite({ name: "My Site" });

      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      const res = await app.request("/api/sites");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sites).toHaveLength(1);
      expect(body.sites[0].name).toBe("My Site");
      expect(body.sites[0].id).toBe(site.id);
    });

    it("only returns sites for current user", async () => {
      // Create site as user 1
      const site = createTestSite({ name: "User 1 Site" });
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Switch to user 2
      mockUserId = "different_user";

      const res = await app.request("/api/sites");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.sites).toEqual([]);
    });
  });

  describe("POST /api/sites", () => {
    it("creates a new site with default name", async () => {
      const res = await app.request("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe("Untitled Site");
      expect(body.id).toBeDefined();
    });

    it("creates a new site with custom name", async () => {
      const res = await app.request("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My New Site" }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.name).toBe("My New Site");
    });
  });

  describe("ownership enforcement", () => {
    it("prevents user from accessing another user's site", async () => {
      // Create site as user 1
      const site = createTestSite();
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Switch to user 2
      mockUserId = "different_user";

      const res = await app.request(`/api/sites/${site.id}`);

      expect(res.status).toBe(404);
    });

    it("prevents user from updating another user's site", async () => {
      // Create site as user 1
      const site = createTestSite();
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Switch to user 2
      mockUserId = "different_user";

      const res = await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...site, name: "Hijacked!" }),
      });

      expect(res.status).toBe(404);
    });

    it("prevents user from deleting another user's site", async () => {
      // Create site as user 1
      const site = createTestSite();
      await app.request(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      // Switch to user 2
      mockUserId = "different_user";

      // Attempt to delete - should succeed (204) but not actually delete
      const deleteRes = await app.request(`/api/sites/${site.id}`, {
        method: "DELETE",
      });
      expect(deleteRes.status).toBe(204);

      // Switch back to user 1 - site should still exist
      mockUserId = "test_user_123";
      const getRes = await app.request(`/api/sites/${site.id}`);
      expect(getRes.status).toBe(200);
    });
  });

  describe("PATCH /api/sites/:siteId/sections/:sectionId", () => {
    it("updates a section and returns it", async () => {
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
      const res = await app.request("/api/sites/non-existent/sections/some-section", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: "Test" }),
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Site not found");
    });

    it("returns 404 for non-existent section", async () => {
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

  describe("PATCH /api/sites/:siteId/pages/:pageId", () => {
    it("updates page sections order", async () => {
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

  describe("DELETE /api/sites/:siteId/pages/:pageId/sections/:sectionId", () => {
    it("deletes a section from a page", async () => {
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
      const res = await app.request("/api/sites/nonexistent/pages/page1/sections/section1", {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Site not found");
    });

    it("returns 404 when page not found", async () => {
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

      const res = await app.request(`/api/sites/${site.id}/pages/${pageId}/sections/nonexistent`, {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Section not found");
    });

    it("prevents deletion of navbar", async () => {
      const navbar = { id: crypto.randomUUID(), type: "navbar", preset: "navbar-minimal" } as Section;
      const pageId = crypto.randomUUID();

      const site = createTestSite({
        pages: {
          [pageId]: {
            id: pageId,
            slug: "/",
            meta: { title: "Home" },
            sections: [navbar],
          },
        },
        tree: [{ pageId, slug: "/", children: [] }],
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
      const footer = { id: crypto.randomUUID(), type: "footer", preset: "footer-simple" } as Section;
      const pageId = crypto.randomUUID();

      const site = createTestSite({
        pages: {
          [pageId]: {
            id: pageId,
            slug: "/",
            meta: { title: "Home" },
            sections: [footer],
          },
        },
        tree: [{ pageId, slug: "/", children: [] }],
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
});
