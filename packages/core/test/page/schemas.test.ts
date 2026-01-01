import { describe, expect, it } from "vitest";
import { pageSchema, validatePage } from "../../src/page/schemas";
import { createPage } from "../../src/page/types";

const uuid = "550e8400-e29b-41d4-a716-446655440000";
const uuid2 = "550e8400-e29b-41d4-a716-446655440001";
const uuid3 = "550e8400-e29b-41d4-a716-446655440002";

describe("page schemas", () => {
  describe("pageSchema", () => {
    it("validates minimal page", () => {
      const result = pageSchema.safeParse({
        id: uuid,
        slug: "home",
        meta: { title: "Home" },
        sections: [],
      });
      expect(result.success).toBe(true);
    });

    it("validates page with sections", () => {
      const result = pageSchema.safeParse({
        id: uuid,
        slug: "home",
        meta: { title: "Home", description: "Welcome" },
        sections: [
          { id: uuid2, type: "hero", headline: "Welcome" },
          { id: uuid3, type: "cta", headline: "Get Started", buttonText: "Sign Up", buttonHref: "/signup" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid section in page", () => {
      const result = pageSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        slug: "home",
        meta: { title: "Home" },
        sections: [{ id: "1", type: "invalid" }],
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing meta title", () => {
      const result = pageSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        slug: "home",
        meta: {},
        sections: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid uuid", () => {
      const result = pageSchema.safeParse({
        id: "not-a-uuid",
        slug: "home",
        meta: { title: "Home" },
        sections: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validatePage", () => {
    it("returns success for valid page", () => {
      const result = validatePage({
        id: "550e8400-e29b-41d4-a716-446655440000",
        slug: "about",
        meta: { title: "About Us" },
        sections: [],
      });
      expect(result.success).toBe(true);
    });

    it("returns error for invalid page", () => {
      const result = validatePage({ invalid: true });
      expect(result.success).toBe(false);
    });
  });

  describe("createPage", () => {
    it("creates page with defaults", () => {
      const page = createPage("home", { title: "Home" });
      expect(page.slug).toBe("home");
      expect(page.meta.title).toBe("Home");
      expect(page.sections).toEqual([]);
      expect(page.id).toBeDefined();
    });

    it("creates page with sections", () => {
      const sections = [{ id: "1", type: "hero" as const, headline: "Welcome" }];
      const page = createPage("about", { title: "About" }, sections);
      expect(page.sections).toHaveLength(1);
    });
  });
});
