import { describe, expect, it } from "vitest";
import {
  heroSectionSchema,
  featuresSectionSchema,
  ctaSectionSchema,
  sectionSchema,
  validateSection,
  validateSections,
} from "../../src/sections/schemas";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("section schemas", () => {
  describe("heroSectionSchema", () => {
    it("validates minimal hero section", () => {
      const result = heroSectionSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
      });
      expect(result.success).toBe(true);
    });

    it("validates full hero section", () => {
      const result = heroSectionSchema.safeParse({
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
      const result = heroSectionSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
        alignment: "top",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("featuresSectionSchema", () => {
    it("validates features section with items", () => {
      const result = featuresSectionSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty items array", () => {
      const result = featuresSectionSchema.safeParse({
        id: uuid,
        type: "features",
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it("validates columns option", () => {
      const result = featuresSectionSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 3,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid columns", () => {
      const result = featuresSectionSchema.safeParse({
        id: uuid,
        type: "features",
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ctaSectionSchema", () => {
    it("validates minimal cta section", () => {
      const result = ctaSectionSchema.safeParse({
        id: uuid,
        type: "cta",
        headline: "Get started",
        buttonText: "Sign up",
        buttonHref: "/signup",
      });
      expect(result.success).toBe(true);
    });

    it("validates full cta section", () => {
      const result = ctaSectionSchema.safeParse({
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
      const result = ctaSectionSchema.safeParse({
        id: uuid,
        type: "cta",
        headline: "Get started",
        buttonHref: "/signup",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("sectionSchema (discriminated union)", () => {
    it("parses hero section", () => {
      const result = sectionSchema.safeParse({
        id: uuid,
        type: "hero",
        headline: "Welcome",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hero");
      }
    });

    it("rejects unknown section type", () => {
      const result = sectionSchema.safeParse({
        id: uuid,
        type: "unknown",
        content: "test",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateSection", () => {
    it("validates valid section", () => {
      const result = validateSection({
        id: uuid,
        type: "hero",
        headline: "Welcome",
      });
      expect(result.success).toBe(true);
    });

    it("returns error for invalid section", () => {
      const result = validateSection({
        id: uuid,
        type: "hero",
      });
      expect(result.success).toBe(false);
    });

    it("returns error for invalid type", () => {
      const result = validateSection({
        id: uuid,
        type: "unknown",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateSections", () => {
    it("validates valid section array", () => {
      const result = validateSections([
        { id: uuid, type: "hero", headline: "Welcome" },
        { id: "550e8400-e29b-41d4-a716-446655440001", type: "cta", headline: "Get Started", buttonText: "Sign Up", buttonHref: "/signup" },
      ]);
      expect(result.success).toBe(true);
    });

    it("validates empty array", () => {
      const result = validateSections([]);
      expect(result.success).toBe(true);
    });

    it("returns error for invalid section in array", () => {
      const result = validateSections([
        { id: uuid, type: "hero", headline: "Welcome" },
        { id: "550e8400-e29b-41d4-a716-446655440001", type: "hero" },
      ]);
      expect(result.success).toBe(false);
    });

    it("returns error for non-array input", () => {
      const result = validateSections("not an array");
      expect(result.success).toBe(false);
    });
  });
});
