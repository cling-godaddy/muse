import { describe, it, expect } from "vitest";
import { createTestSite, setupTestApp } from "./_fixtures";

describe("DELETE /api/sites/:id", () => {
  const getApp = setupTestApp();

  it("deletes an existing site", async () => {
    const app = getApp();

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
    const app = getApp();

    const res = await app.request("/api/sites/non-existent", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });
});
