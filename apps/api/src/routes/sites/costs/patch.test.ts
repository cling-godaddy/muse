import { describe, it, expect } from "vitest";
import { createTestSite, setupTestApp } from "../_fixtures";
import type { UsageAction } from "@muse/core";

describe("PATCH /api/sites/:siteId/costs", () => {
  const getApp = setupTestApp();

  it("appends a cost entry to a site with no existing costs", async () => {
    const app = getApp();
    const site = createTestSite();

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const cost = {
      input: 100,
      output: 50,
      cost: 0.01,
      model: "gpt-4o-mini",
      action: "rewrite_text" as UsageAction,
      timestamp: "2024-01-01T00:00:00.000Z",
    };

    const res = await app.request(`/api/sites/${site.id}/costs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cost),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify the cost was appended
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.costs).toHaveLength(1);
    expect(loaded.costs[0]).toEqual(cost);
  });

  it("appends to existing costs array", async () => {
    const app = getApp();
    const existingCost = {
      input: 500,
      output: 200,
      cost: 0.05,
      model: "gpt-4",
      action: "generate_site" as UsageAction,
      timestamp: "2024-01-01T00:00:00.000Z",
    };
    const site = createTestSite({ costs: [existingCost] });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    const newCost = {
      input: 100,
      output: 50,
      cost: 0.01,
      model: "gpt-4o-mini",
      action: "rewrite_text" as UsageAction,
      timestamp: "2024-01-02T00:00:00.000Z",
    };

    const res = await app.request(`/api/sites/${site.id}/costs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCost),
    });

    expect(res.status).toBe(200);

    // Verify both costs exist
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.costs).toHaveLength(2);
    expect(loaded.costs[0]).toEqual(existingCost);
    expect(loaded.costs[1]).toEqual(newCost);
  });

  it("returns 404 for non-existent site", async () => {
    const app = getApp();

    const res = await app.request("/api/sites/non-existent/costs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: 100, output: 50, cost: 0.01, model: "test" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("does not overwrite other site data", async () => {
    const app = getApp();
    const pageId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const site = createTestSite({
      name: "My Site",
      pages: {
        [pageId]: {
          id: pageId,
          slug: "/",
          parentId: null,
          order: 0,
          meta: { title: "Home" },
          sections: [
            {
              id: sectionId,
              type: "hero" as const,
              headline: "Welcome",
            },
          ],
        },
      },
    });

    await app.request(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });

    // Append cost
    const res = await app.request(`/api/sites/${site.id}/costs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: 100,
        output: 50,
        cost: 0.01,
        model: "gpt-4o-mini",
        timestamp: "2024-01-01T00:00:00.000Z",
      }),
    });

    expect(res.status).toBe(200);

    // Verify site data unchanged
    const getRes = await app.request(`/api/sites/${site.id}`);
    const loaded = await getRes.json();
    expect(loaded.name).toBe("My Site");
    expect(loaded.pages[pageId].sections[0].headline).toBe("Welcome");
    expect(loaded.costs).toHaveLength(1);
  });
});
