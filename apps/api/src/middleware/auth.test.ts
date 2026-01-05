import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { requireAuth } from "./auth";

// Mock @hono/clerk-auth
vi.mock("@hono/clerk-auth", () => ({
  getAuth: vi.fn(),
}));

import { getAuth } from "@hono/clerk-auth";

const mockGetAuth = vi.mocked(getAuth);

describe("requireAuth middleware", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.use("/*", requireAuth);
    app.get("/test", c => c.json({ userId: c.get("userId") }));
  });

  it("returns 401 when no auth present", async () => {
    mockGetAuth.mockReturnValue(null);

    const res = await app.request("/test");

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when auth has no userId", async () => {
    mockGetAuth.mockReturnValue({ userId: null } as ReturnType<typeof getAuth>);

    const res = await app.request("/test");

    expect(res.status).toBe(401);
  });

  it("passes through and sets userId when authenticated", async () => {
    mockGetAuth.mockReturnValue({
      userId: "user_123",
      sessionId: "sess_123",
    } as ReturnType<typeof getAuth>);

    const res = await app.request("/test");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user_123");
  });
});
