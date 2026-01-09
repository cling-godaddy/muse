import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { chatRoute } from "./chat";
import type { ToolCall, ToolResult } from "@muse/ai";

// Mock auth middleware
vi.mock("../middleware/auth", () => ({
  requireAuth: vi.fn(async (_c, next) => await next()),
}));

// Track executeTool callback for refine tests
let capturedExecuteTool: ((call: ToolCall) => Promise<ToolResult>) | null = null;

// Mock fetch for set_typography persistence
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock AI client - agents return incomplete usage (input/output only)
const mockItemResponse = {
  content: JSON.stringify({
    item: {
      icon: "sparkles",
      title: "Test Feature",
      description: "Test description",
      image: null,
    },
  }),
  usage: { input: 100, output: 50 }, // Agents return incomplete usage
};

const mockSectionResponse = {
  content: JSON.stringify({
    section: {
      type: "hero",
      preset: "hero-centered",
      headline: "Test Headline",
      subheadline: "Test subheadline",
    },
  }),
  usage: { input: 200, output: 100 }, // Agents return incomplete usage
};

vi.mock("@muse/ai", async () => {
  const actual = await vi.importActual("@muse/ai");
  return {
    ...actual,
    createClient: () => ({
      chat: vi.fn(async () => mockItemResponse),
    }),
    // Refine captures executeTool so tests can invoke tool handlers directly
    refine: vi.fn(async (_input, _provider, executeTool) => {
      capturedExecuteTool = executeTool;
      return {
        message: "Done",
        toolCalls: [],
        failedCalls: [],
        usage: { input: 100, output: 50 },
      };
    }),
    // Mock executeEditSection for edit_section tool tests
    executeEditSection: vi.fn(async ({ sectionId, field, value }) => ({
      section: { id: sectionId, type: "hero", [field]: value },
    })),
    generateItemAgent: {
      config: { model: "gpt-4o-mini" },
      run: vi.fn(async () => mockItemResponse),
    },
    singleSectionAgent: {
      config: { model: "gpt-4o-mini" },
      run: vi.fn(async () => mockSectionResponse),
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
        usage: { input: 50, output: 25 },
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
          name: "Bento Grid",
          imageRequirements: { category: "subject", count: 6, orientation: "mixed" },
          imageInjection: { type: "nested", array: "items", field: "image" },
        };
      }
      if (presetId === "hero-centered") {
        return {
          id: "hero-centered",
          name: "Centered Hero",
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

    // Reset fetch mock - default to success for PATCH requests
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
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

    it("returns complete Usage object with all required fields", async () => {
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

      // Verify complete Usage object (would have caught Issue 1)
      expect(data.usage).toBeDefined();
      expect(data.usage).toHaveProperty("input");
      expect(data.usage).toHaveProperty("output");
      expect(data.usage).toHaveProperty("cost");
      expect(data.usage).toHaveProperty("model");
      expect(data.usage).toHaveProperty("action");
      expect(data.usage).toHaveProperty("detail");
      expect(data.usage).toHaveProperty("timestamp");

      // Verify types
      expect(typeof data.usage.input).toBe("number");
      expect(typeof data.usage.output).toBe("number");
      expect(typeof data.usage.cost).toBe("number");
      expect(typeof data.usage.model).toBe("string");
      expect(typeof data.usage.action).toBe("string");
      expect(typeof data.usage.detail).toBe("string");
      expect(typeof data.usage.timestamp).toBe("string");

      // Verify values from mock
      expect(data.usage.input).toBe(100);
      expect(data.usage.output).toBe(50);
      expect(data.usage.model).toBe("gpt-4o-mini");
      expect(data.usage.action).toBe("generate_item");
      expect(data.usage.detail).toBe("feature");
      // Cost should be calculated: (100 * 0.15 + 50 * 0.6) / 1M
      expect(data.usage.cost).toBeCloseTo(0.000045, 8);
      // Timestamp should be ISO 8601
      expect(new Date(data.usage.timestamp).toISOString()).toBe(data.usage.timestamp);
    });
  });

  describe("POST /api/chat/generate-section", () => {
    it("returns complete Usage object with cost and model", async () => {
      const res = await app.request("/api/chat/generate-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-token",
        },
        body: JSON.stringify({
          sectionType: "hero",
          preset: "hero-centered",
          siteContext: {
            name: "Test Site",
            description: "A test site",
          },
          existingSections: [],
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify section was generated
      expect(data.section).toBeDefined();
      expect(data.section.type).toBe("hero");
      expect(data.section.headline).toBe("Test Headline");

      // Verify complete Usage object (would have caught Issue 1)
      expect(data.usage).toBeDefined();
      expect(data.usage).toHaveProperty("input");
      expect(data.usage).toHaveProperty("output");
      expect(data.usage).toHaveProperty("cost");
      expect(data.usage).toHaveProperty("model");
      expect(data.usage).toHaveProperty("action");
      expect(data.usage).toHaveProperty("detail");
      expect(data.usage).toHaveProperty("timestamp");

      // Verify types
      expect(typeof data.usage.input).toBe("number");
      expect(typeof data.usage.output).toBe("number");
      expect(typeof data.usage.cost).toBe("number");
      expect(typeof data.usage.model).toBe("string");

      // Verify values from mock
      expect(data.usage.input).toBe(200);
      expect(data.usage.output).toBe(100);
      expect(data.usage.model).toBe("gpt-4o-mini");
      expect(data.usage.action).toBe("generate_section");
      expect(data.usage.detail).toBe("hero");
      // Cost should be calculated: (200 * 0.15 + 100 * 0.6) / 1M
      expect(data.usage.cost).toBeCloseTo(0.00009, 8);
      // Timestamp should be ISO 8601
      expect(new Date(data.usage.timestamp).toISOString()).toBe(data.usage.timestamp);
    });
  });

  describe("POST /api/chat/refine", () => {
    async function callRefine(body: Record<string, unknown>) {
      const res = await app.request("/api/chat/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock-token",
        },
        body: JSON.stringify(body),
      });
      return res;
    }

    const baseRefineBody = {
      siteId: "site-123",
      sections: [{ id: "s1", type: "hero", preset: "hero-centered" }],
      messages: [{ role: "user", content: "test" }],
      theme: { palette: "ocean", typography: "inter" },
    };

    it("returns 200 for basic refine request", async () => {
      const res = await callRefine(baseRefineBody);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe("Done");
      expect(data.usage).toBeDefined();
    });

    describe("edit_section tool", () => {
      async function invokeEditSection(sectionId: string, field: string, value: unknown) {
        if (!capturedExecuteTool) throw new Error("executeTool not captured");
        return capturedExecuteTool({
          id: "call-1",
          name: "edit_section",
          input: { sectionId, field, value },
        });
      }

      it("returns error when section not found", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeEditSection("nonexistent", "headline", "New Title");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Section not found");
      });

      it("returns error for invalid field", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeEditSection("s1", "invalidField", "value");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Invalid field");
      });

      it("returns success for valid section and field", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeEditSection("s1", "headline", "New Headline");

        expect(result.result).toHaveProperty("success", true);
      });
    });

    describe("move_section tool", () => {
      async function invokeMoveSection(sectionId: string, direction: "up" | "down") {
        if (!capturedExecuteTool) throw new Error("executeTool not captured");
        return capturedExecuteTool({
          id: "call-1",
          name: "move_section",
          input: { sectionId, direction },
        });
      }

      it("returns error when section not found", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeMoveSection("nonexistent", "up");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Section not found");
      });

      it("returns error when trying to move footer", async () => {
        const bodyWithFooter = {
          ...baseRefineBody,
          sections: [{ id: "footer-1", type: "footer", preset: "footer-simple" }],
        };
        await callRefine(bodyWithFooter);
        const result = await invokeMoveSection("footer-1", "up");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Footer sections cannot be moved");
      });

      it("returns success with direction for valid section", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeMoveSection("s1", "down");

        expect(result.result).toHaveProperty("success", true);
        expect(result.result).toHaveProperty("direction", "down");
      });
    });

    describe("delete_section tool", () => {
      async function invokeDeleteSection(sectionId: string) {
        if (!capturedExecuteTool) throw new Error("executeTool not captured");
        return capturedExecuteTool({
          id: "call-1",
          name: "delete_section",
          input: { sectionId },
        });
      }

      it("returns error when section not found", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeDeleteSection("nonexistent");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Section not found");
      });

      it("returns error when trying to delete navbar", async () => {
        const bodyWithNavbar = {
          ...baseRefineBody,
          sections: [{ id: "nav-1", type: "navbar", preset: "navbar-simple" }],
        };
        await callRefine(bodyWithNavbar);
        const result = await invokeDeleteSection("nav-1");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Cannot delete navbar");
      });

      it("returns error when trying to delete footer", async () => {
        const bodyWithFooter = {
          ...baseRefineBody,
          sections: [{ id: "footer-1", type: "footer", preset: "footer-simple" }],
        };
        await callRefine(bodyWithFooter);
        const result = await invokeDeleteSection("footer-1");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Cannot delete footer");
      });

      it("returns needsConfirmation for valid section", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeDeleteSection("s1");

        expect(result.result).toHaveProperty("needsConfirmation", true);
      });
    });

    describe("add_section tool", () => {
      async function invokeAddSection(input: { sectionType?: string, preset?: string, index?: number }) {
        if (!capturedExecuteTool) throw new Error("executeTool not captured");
        return capturedExecuteTool({
          id: "call-1",
          name: "add_section",
          input,
        });
      }

      it("returns needsConfirmation with select_type step when no params", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeAddSection({});

        expect(result.result).toHaveProperty("needsConfirmation", true);
      });

      it("returns error for invalid section type", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeAddSection({ sectionType: "invalid-type" });

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Invalid section type");
      });

      it("returns needsConfirmation with select_preset step for valid type without preset", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeAddSection({ sectionType: "hero" });

        expect(result.result).toHaveProperty("needsConfirmation", true);
      });

      it("returns error for invalid preset", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeAddSection({ sectionType: "hero", preset: "invalid-preset" });

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Invalid preset");
      });

      it("returns needsConfirmation for valid type and preset", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeAddSection({ sectionType: "hero", preset: "hero-centered" });

        expect(result.result).toHaveProperty("needsConfirmation", true);
      });
    });

    describe("set_typography tool", () => {
      async function invokeSetTypography(typography: string) {
        if (!capturedExecuteTool) throw new Error("executeTool not captured");
        return capturedExecuteTool({
          id: "call-1",
          name: "set_typography",
          input: { typography },
        });
      }

      it("returns error for invalid typography ID", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeSetTypography("not-a-real-font");

        expect(result.result).toHaveProperty("error");
        expect((result.result as { error: string }).error).toContain("Invalid typography");
      });

      it("returns success with theme for valid typography ID", async () => {
        await callRefine(baseRefineBody);
        const result = await invokeSetTypography("oswald");

        expect(result.result).toHaveProperty("success", true);
        expect(result.result).toHaveProperty("theme");
        const theme = (result.result as { theme: { palette: string, typography: string } }).theme;
        expect(theme.typography).toBe("oswald");
        expect(theme.palette).toBe("ocean"); // preserved from request
      });

      it("uses default palette when theme not provided", async () => {
        await callRefine({ ...baseRefineBody, theme: undefined });
        const result = await invokeSetTypography("playfair");

        expect(result.result).toHaveProperty("success", true);
        const theme = (result.result as { theme: { palette: string, typography: string } }).theme;
        expect(theme.typography).toBe("playfair");
        expect(theme.palette).toBe("slate"); // default fallback
      });
    });
  });
});
