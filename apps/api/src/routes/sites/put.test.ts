import { describe, it, expect } from "vitest";
import { createTestSite, setupTestApp } from "./_fixtures";

describe("PUT /api/sites/:id", () => {
  const getApp = setupTestApp();

  it("creates a new site", async () => {
    const app = getApp();

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
    const app = getApp();

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
    const app = getApp();

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
    const app = getApp();

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
