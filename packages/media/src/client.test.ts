import { describe, it, expect, vi } from "vitest";
import { createMediaClient } from "./client";

describe("createMediaClient", () => {
  it("creates client with both providers", () => {
    const client = createMediaClient({
      unsplashKey: "test-unsplash",
      pexelsKey: "test-pexels",
    });

    expect(client).toHaveProperty("search");
    expect(client).toHaveProperty("executePlan");
  });

  it("creates client with only unsplash", () => {
    const client = createMediaClient({
      unsplashKey: "test-unsplash",
    });

    expect(client).toBeDefined();
  });

  it("creates client with only pexels", () => {
    const client = createMediaClient({
      pexelsKey: "test-pexels",
    });

    expect(client).toBeDefined();
  });

  it("logs warning when no providers configured", () => {
    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn(),
    };

    createMediaClient({ logger: mockLogger });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      "no_providers",
      { message: "No media provider credentials configured - image search disabled" },
    );
  });

  it("search returns empty array for unconfigured provider", async () => {
    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn(),
    };
    const client = createMediaClient({
      unsplashKey: "test-unsplash",
      logger: mockLogger,
    });

    const results = await client.search({
      query: "test",
      provider: "pexels",
    });

    expect(results).toEqual([]);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "provider_not_configured",
      { provider: "pexels" },
    );
  });

  it("executePlan returns empty array when no providers", async () => {
    const client = createMediaClient({});

    const results = await client.executePlan([
      {
        blockId: "hero_1",
        placement: "background",
        provider: "unsplash",
        searchQuery: "test",
        orientation: "horizontal",
      },
    ]);

    expect(results).toEqual([]);
  });
});
