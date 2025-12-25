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

  it("warns when no providers configured", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    createMediaClient({});

    expect(warnSpy).toHaveBeenCalledWith(
      "No media provider credentials configured - image search disabled",
    );

    warnSpy.mockRestore();
  });

  it("search returns empty array for unconfigured provider", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = createMediaClient({
      unsplashKey: "test-unsplash",
    });

    const results = await client.search({
      query: "test",
      provider: "pexels",
    });

    expect(results).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Provider pexels not configured, skipping search",
    );

    warnSpy.mockRestore();
  });

  it("executePlan returns empty array when no providers", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
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

    warnSpy.mockRestore();
  });
});
