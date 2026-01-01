import { describe, expect, it } from "vitest";
import {
  registerSectionMeta,
  getSectionMeta,
  getAllSectionMeta,
  type SectionMeta,
} from "../../src/sections/metadata";

describe("section metadata registry", () => {
  describe("default registrations", () => {
    it("has hero metadata registered", () => {
      const meta = getSectionMeta("hero");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("hero");
      expect(meta?.label).toBe("Hero");
      expect(meta?.category).toBe("layout");
    });

    it("has features metadata registered", () => {
      const meta = getSectionMeta("features");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("features");
      expect(meta?.label).toBe("Features");
      expect(meta?.category).toBe("content");
    });

    it("has cta metadata registered", () => {
      const meta = getSectionMeta("cta");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("cta");
      expect(meta?.label).toBe("Call to Action");
      expect(meta?.category).toBe("cta");
    });
  });

  describe("getSectionMeta", () => {
    it("returns undefined for unknown type", () => {
      const meta = getSectionMeta("unknown" as "hero");
      expect(meta).toBeUndefined();
    });
  });

  describe("getAllSectionMeta", () => {
    it("returns all registered metadata", () => {
      const allMeta = getAllSectionMeta();
      expect(allMeta.length).toBeGreaterThanOrEqual(3);
      const types = allMeta.map(m => m.type);
      expect(types).toContain("hero");
      expect(types).toContain("features");
      expect(types).toContain("cta");
    });

    it("all entries have required fields", () => {
      const allMeta = getAllSectionMeta();
      for (const meta of allMeta) {
        expect(meta.type).toBeDefined();
        expect(meta.label).toBeDefined();
        expect(meta.icon).toBeDefined();
        expect(meta.category).toBeDefined();
        expect(meta.description).toBeDefined();
      }
    });
  });

  describe("registerSectionMeta", () => {
    it("registers and retrieves custom metadata", () => {
      const customMeta: SectionMeta = {
        type: "hero",
        label: "Custom Hero",
        icon: "custom-icon",
        category: "layout",
        description: "Custom hero section",
      };
      registerSectionMeta(customMeta);
      const retrieved = getSectionMeta("hero");
      expect(retrieved?.label).toBe("Custom Hero");
    });
  });
});
