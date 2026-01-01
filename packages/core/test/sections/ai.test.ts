import { describe, expect, it } from "vitest";
import {
  registerAISectionSchema,
  getAISectionSchema,
  getAllAISectionSchemas,
  generateSectionSchemaPrompt,
  type AISectionSchema,
} from "../../src/sections/ai";

describe("AI section schema registry", () => {
  describe("default registrations", () => {
    it("has hero schema registered", () => {
      const schema = getAISectionSchema("hero");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("hero");
      expect(schema?.required).toContain("headline");
    });

    it("has features schema registered", () => {
      const schema = getAISectionSchema("features");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("features");
      expect(schema?.required).toContain("items");
    });

    it("has cta schema registered", () => {
      const schema = getAISectionSchema("cta");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("cta");
      expect(schema?.required).toContain("headline");
      expect(schema?.required).toContain("buttonText");
      expect(schema?.required).toContain("buttonHref");
    });
  });

  describe("getAISectionSchema", () => {
    it("returns undefined for unknown type", () => {
      const schema = getAISectionSchema("unknown" as "hero");
      expect(schema).toBeUndefined();
    });
  });

  describe("getAllAISectionSchemas", () => {
    it("returns all registered schemas", () => {
      const schemas = getAllAISectionSchemas();
      expect(schemas.length).toBeGreaterThanOrEqual(3);
      const types = schemas.map(s => s.type);
      expect(types).toContain("hero");
      expect(types).toContain("features");
      expect(types).toContain("cta");
    });
  });

  describe("registerAISectionSchema", () => {
    it("registers and retrieves custom schema", () => {
      const customSchema: AISectionSchema = {
        type: "hero",
        description: "Custom hero section",
        properties: {
          headline: { type: "string", description: "Headline", required: true },
          subheadline: { type: "string", description: "Subheadline" },
        },
        required: ["headline"],
      };
      registerAISectionSchema(customSchema);
      const retrieved = getAISectionSchema("hero");
      expect(retrieved?.description).toBe("Custom hero section");
    });
  });

  describe("generateSectionSchemaPrompt", () => {
    it("generates prompt with all section types", () => {
      const prompt = generateSectionSchemaPrompt();
      expect(prompt).toContain("Section: hero");
      expect(prompt).toContain("Section: features");
      expect(prompt).toContain("Section: cta");
    });

    it("includes descriptions", () => {
      const prompt = generateSectionSchemaPrompt();
      expect(prompt).toContain("Description:");
    });

    it("includes field definitions", () => {
      const prompt = generateSectionSchemaPrompt();
      expect(prompt).toContain("Fields:");
      expect(prompt).toContain("headline");
    });

    it("marks required fields", () => {
      const prompt = generateSectionSchemaPrompt();
      expect(prompt).toContain("required");
    });
  });
});
