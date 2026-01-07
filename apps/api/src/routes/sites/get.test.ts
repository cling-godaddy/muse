import { describe, it, expect } from "vitest";
import { createTestSite, setupTestApp, setMockUserId } from "./_fixtures";

describe("GET /api/sites/:id", () => {
  const getApp = setupTestApp();

  it("returns 404 for non-existent site", async () => {
    const app = getApp();

    const res = await app.request("/api/sites/non-existent");

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("returns site after creation", async () => {
    const app = getApp();

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

describe("GET /api/sites", () => {
  const getApp = setupTestApp();

  it("returns empty list initially", async () => {
    const app = getApp();

    const res = await app.request("/api/sites");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sites).toEqual([]);
  });

  it("returns user's sites", async () => {
    const app = getApp();

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
    const app = getApp();

    // Create site as user 1
    const site = createTestSite({ name: "User 1 Site" });
    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Switch to user 2
    setMockUserId("different_user");

    const res = await app.request("/api/sites");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sites).toEqual([]);
  });
});

describe("ownership enforcement", () => {
  const getApp = setupTestApp();

  it("prevents user from accessing another user's site", async () => {
    const app = getApp();

    // Create site as user 1
    const site = createTestSite();
    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Switch to user 2
    setMockUserId("different_user");

    const res = await app.request(`/api/sites/${site.id}`);

    expect(res.status).toBe(404);
  });

  it("prevents user from updating another user's site", async () => {
    const app = getApp();

    // Create site as user 1
    const site = createTestSite();
    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Switch to user 2
    setMockUserId("different_user");

    const res = await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...site, name: "Hijacked!" }),
    });

    expect(res.status).toBe(404);
  });

  it("prevents user from deleting another user's site", async () => {
    const app = getApp();

    // Create site as user 1
    const site = createTestSite();
    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Switch to user 2
    setMockUserId("different_user");

    // Attempt to delete - should succeed (204) but not actually delete
    const deleteRes = await app.request(`/api/sites/${site.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    // Switch back to user 1 - site should still exist
    setMockUserId("test_user_123");
    const getRes = await app.request(`/api/sites/${site.id}`);
    expect(getRes.status).toBe(200);
  });
});
