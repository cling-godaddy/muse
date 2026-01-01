import { describe, expect, it } from "vitest";
import {
  registerBlockMeta,
  getBlockMeta,
  getAllBlockMeta,
  type BlockMeta,
} from "../../src/blocks/metadata";

describe("block metadata registry", () => {
  describe("default registrations", () => {
    it("has hero metadata registered", () => {
      const meta = getBlockMeta("hero");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("hero");
      expect(meta?.label).toBe("Hero");
      expect(meta?.category).toBe("layout");
    });

    it("has features metadata registered", () => {
      const meta = getBlockMeta("features");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("features");
      expect(meta?.label).toBe("Features");
      expect(meta?.category).toBe("content");
    });

    it("has cta metadata registered", () => {
      const meta = getBlockMeta("cta");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("cta");
      expect(meta?.label).toBe("Call to Action");
      expect(meta?.category).toBe("cta");
    });
  });

  describe("getBlockMeta", () => {
    it("returns undefined for unknown type", () => {
      const meta = getBlockMeta("unknown" as "text");
      expect(meta).toBeUndefined();
    });
  });

  describe("getAllBlockMeta", () => {
    it("returns all registered metadata", () => {
      const allMeta = getAllBlockMeta();
      expect(allMeta.length).toBeGreaterThanOrEqual(3);
      const types = allMeta.map(m => m.type);
      expect(types).toContain("hero");
      expect(types).toContain("features");
      expect(types).toContain("cta");
    });

    it("all entries have required fields", () => {
      const allMeta = getAllBlockMeta();
      for (const meta of allMeta) {
        expect(meta.type).toBeDefined();
        expect(meta.label).toBeDefined();
        expect(meta.icon).toBeDefined();
        expect(meta.category).toBeDefined();
        expect(meta.description).toBeDefined();
      }
    });
  });

  describe("registerBlockMeta", () => {
    it("registers and retrieves custom metadata", () => {
      const customMeta: BlockMeta = {
        type: "hero",
        label: "Custom Hero",
        icon: "custom-icon",
        category: "layout",
        description: "Custom hero block",
      };
      registerBlockMeta(customMeta);
      const retrieved = getBlockMeta("hero");
      expect(retrieved?.label).toBe("Custom Hero");
    });
  });
});
