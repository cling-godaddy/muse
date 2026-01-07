import { vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { sitesRoute, resetSitesRoute } from "../sites";
import { resetSitesTable } from "@muse/db";
import type { Site } from "@muse/core";

let mockUserId = "test_user_123";

// Mock clerk auth to return configurable user
vi.mock("@hono/clerk-auth", () => ({
  getAuth: () => ({ userId: mockUserId }),
}));

export function setMockUserId(userId: string) {
  mockUserId = userId;
}

export function createTestSite(overrides: Partial<Site> = {}): Site {
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

export function setupTestApp() {
  let app: Hono;

  beforeEach(() => {
    mockUserId = "test_user_123";
    resetSitesTable();
    resetSitesRoute();
    app = new Hono();
    app.route("/api/sites", sitesRoute);
  });

  return () => app;
}
