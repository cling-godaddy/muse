import { describe, expect, it } from "vitest";
import { getSectionMeta, getAllSectionMeta } from "../../src/sections/metadata";
import { DEFAULT_PRESETS } from "../../src/sections";

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

  describe("sync with presets", () => {
    it("has metadata for every section type with presets", () => {
      const sectionTypes = Object.keys(DEFAULT_PRESETS);
      const metadataTypes = getAllSectionMeta().map(m => m.type);

      for (const type of sectionTypes) {
        expect(metadataTypes, `missing metadata for section type: ${type}`).toContain(type);
      }
    });
  });
});
