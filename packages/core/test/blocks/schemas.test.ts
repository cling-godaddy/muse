import { describe, expect, it } from "vitest";
import {
  textBlockSchema,
  heroBlockSchema,
  featuresBlockSchema,
  ctaBlockSchema,
  blockSchema,
} from "../../src/blocks/schemas";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("block schemas", () => {
  describe("textBlockSchema", () => {
    it("validates valid text block", () => {
      const result = textBlockSchema.safeParse({
        id: uuid,
        type: "text",
        content: "hello",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing content", () => {
      const result = textBlockSchema.safeParse({
        id: uuid,
        type: "text",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid uuid", () => {
      const result = textBlockSchema.safeParse({
        id: "not-a-uuid",
        type: "text",
        content: "hello",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("heroBlockSchema", () => {
    it("validates minimal hero block", () => {
      const result = heroBlockSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
      });
      expect(result.success).toBe(true);
    });

    it("validates full hero block", () => {
      const result = heroBlockSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
        subheadline: "Get started today",
        cta: { text: "Sign up", href: "/signup" },
        secondaryCta: { text: "Learn more", href: "/about" },
        alignment: "center",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid alignment", () => {
      const result = heroBlockSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
        alignment: "top",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("featuresBlockSchema", () => {
    it("validates features block with items", () => {
      const result = featuresBlockSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty items array", () => {
      const result = featuresBlockSchema.safeParse({
        id: uuid,
        type: "features",
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it("validates columns option", () => {
      const result = featuresBlockSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 3,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid columns", () => {
      const result = featuresBlockSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ctaBlockSchema", () => {
    it("validates minimal cta block", () => {
      const result = ctaBlockSchema.safeParse({
        id: uuid,
        type: "cta",
        headline: "Get started",
        buttonText: "Sign up",
        buttonHref: "/signup",
      });
      expect(result.success).toBe(true);
    });

    it("validates full cta block", () => {
      const result = ctaBlockSchema.safeParse({
        id: uuid,
        type: "cta",
        headline: "Get started",
        description: "Join thousands of users",
        buttonText: "Sign up",
        buttonHref: "/signup",
        variant: "secondary",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing buttonText", () => {
      const result = ctaBlockSchema.safeParse({
        id: uuid,
        type: "cta",
        headline: "Get started",
        buttonHref: "/signup",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("blockSchema (discriminated union)", () => {
    it("parses text block", () => {
      const result = blockSchema.safeParse({
        id: uuid,
        type: "text",
        content: "hello",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("text");
      }
    });

    it("parses hero block", () => {
      const result = blockSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hero");
      }
    });

    it("rejects unknown block type", () => {
      const result = blockSchema.safeParse({
        id: uuid,
        type: "unknown",
        content: "test",
      });
      expect(result.success).toBe(false);
    });
  });
});
