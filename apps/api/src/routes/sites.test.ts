import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { sitesRoute, resetSitesRoute } from "./sites";
import { resetSitesTable } from "@muse/db";
import type { Site } from "@muse/core";

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
      expect(body.success).toBe(true);
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
      expect(deleteRes.status).toBe(200);

      // Verify gone
      const getRes = await app.request(`/api/sites/${site.id}`);
      expect(getRes.status).toBe(404);
    });

    it("succeeds even for non-existent site", async () => {
      const res = await app.request("/api/sites/non-existent", {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
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
  });
});
