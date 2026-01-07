import { describe, it, expect } from "vitest";
import { setupTestApp } from "./_fixtures";

describe("POST /api/sites", () => {
  const getApp = setupTestApp();

  it("creates a new site with default name", async () => {
    const app = getApp();

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
    const app = getApp();

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
