import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { chatRoute } from "./chat";

// Mock auth middleware
vi.mock("../middleware/auth", () => ({
  requireAuth: vi.fn(async (_c, next) => await next()),
}));

// Mock AI client
const mockChatResponse = {
  content: JSON.stringify({
    item: {
      icon: "sparkles",
      title: "Test Feature",
      description: "Test description",
      image: null,
    },
  }),
  usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.01 },
};

vi.mock("@muse/ai", async () => {
  const actual = await vi.importActual("@muse/ai");
  return {
    ...actual,
    createClient: () => ({
      chat: vi.fn(async () => mockChatResponse),
    }),
    generateItemAgent: {
      run: vi.fn(async () => mockChatResponse),
    },
    imageAgent: {
      run: vi.fn(async () => ({
        content: JSON.stringify({
          items: [
            {
              blockId: "test-block",
              category: "subject",
              provider: "getty",
              searchQuery: "test query",
              orientation: "horizontal",
              count: 1,
            },
          ],
        }),
        usage: { inputTokens: 50, outputTokens: 25, totalCost: 0.005 },
      })),
    },
  };
});

// Mock media client
const mockImageSelection = {
  blockId: "test-block",
  category: "subject",
  image: {
    url: "https://example.com/image.jpg",
    alt: "Test image",
    provider: "getty",
    providerId: "12345",
  },
};

vi.mock("@muse/media", async () => {
  const actual = await vi.importActual("@muse/media");
  return {
    ...actual,
    createMediaClient: () => ({
      executePlan: vi.fn(async () => [mockImageSelection]),
    }),
    createQueryNormalizer: vi.fn(() => ({})),
    getIamJwt: vi.fn(async () => "mock-jwt"),
  };
});

// Mock @muse/core preset functions
vi.mock("@muse/core", async () => {
  const actual = await vi.importActual("@muse/core");
  return {
    ...actual,
    getPreset: vi.fn((presetId: string) => {
      if (presetId === "features-bento") {
        return {
          id: "features-bento",
          imageRequirements: { category: "subject", count: 6, orientation: "mixed" },
          imageInjection: { type: "nested", array: "items", field: "image" },
        };
      }
      return undefined;
    }),
  };
});

describe("chat routes", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/api/chat", chatRoute);
  });

  describe("POST /api/chat/generate-item", () => {
    it("generates item without image for non-visual presets", async () => {
      const res = await app.request("/api/chat/generate-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-token",
        },
        body: JSON.stringify({
          itemType: "feature",
          siteContext: {
            name: "Test Site",
            description: "A test site",
          },
          sectionContext: {
            preset: "features-grid",
            existingItems: [],
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.item).toBeDefined();
      expect(data.item.title).toBe("Test Feature");
      expect(data.item.description).toBe("Test description");
      expect(data.item.icon).toBe("sparkles");
      expect(data.item.image).toBeUndefined();
      expect(data.usage).toBeDefined();
    });

    it("generates item with image for visual presets (Bento)", async () => {
      const res = await app.request("/api/chat/generate-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-token",
        },
        body: JSON.stringify({
          itemType: "feature",
          siteContext: {
            name: "Test Site",
            description: "A test site",
          },
          sectionContext: {
            preset: "features-bento",
            existingItems: [],
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.item).toBeDefined();
      expect(data.item.title).toBe("Test Feature");

      // Should have ImageSource structure, not ImageSelection
      expect(data.item.image).toBeDefined();
      expect(data.item.image.url).toBe("https://example.com/image.jpg");
      expect(data.item.image.alt).toBe("Test image");
      expect(data.item.image.provider).toBe("getty");
      expect(data.item.image.providerId).toBe("12345");

      // Should NOT have ImageSelection wrapper properties
      expect(data.item.image.blockId).toBeUndefined();
      expect(data.item.image.category).toBeUndefined();

      expect(data.usage).toBeDefined();
    });
  });
});
