import { describe, expect, it } from "vitest";
import {
  registerAISchema,
  getAISchema,
  getAllAISchemas,
  generateBlockSchemaPrompt,
  type AIBlockSchema,
} from "../../src/blocks/ai";

describe("AI schema registry", () => {
  describe("default registrations", () => {
    it("has hero schema registered", () => {
      const schema = getAISchema("hero");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("hero");
      expect(schema?.required).toContain("headline");
    });

    it("has features schema registered", () => {
      const schema = getAISchema("features");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("features");
      expect(schema?.required).toContain("items");
    });

    it("has cta schema registered", () => {
      const schema = getAISchema("cta");
      expect(schema).toBeDefined();
      expect(schema?.type).toBe("cta");
      expect(schema?.required).toContain("headline");
      expect(schema?.required).toContain("buttonText");
      expect(schema?.required).toContain("buttonHref");
    });
  });

  describe("getAISchema", () => {
    it("returns undefined for unknown type", () => {
      const schema = getAISchema("unknown" as "text");
      expect(schema).toBeUndefined();
    });
  });

  describe("getAllAISchemas", () => {
    it("returns all registered schemas", () => {
      const schemas = getAllAISchemas();
      expect(schemas.length).toBeGreaterThanOrEqual(3);
      const types = schemas.map(s => s.type);
      expect(types).toContain("hero");
      expect(types).toContain("features");
      expect(types).toContain("cta");
    });
  });

  describe("registerAISchema", () => {
    it("registers and retrieves custom schema", () => {
      const customSchema: AIBlockSchema = {
        type: "hero",
        description: "Custom hero block",
        properties: {
          headline: { type: "string", description: "Headline", required: true },
          subheadline: { type: "string", description: "Subheadline" },
        },
        required: ["headline"],
      };
      registerAISchema(customSchema);
      const retrieved = getAISchema("hero");
      expect(retrieved?.description).toBe("Custom hero block");
    });
  });

  describe("generateBlockSchemaPrompt", () => {
    it("generates prompt with all block types", () => {
      const prompt = generateBlockSchemaPrompt();
      expect(prompt).toContain("Block: hero");
      expect(prompt).toContain("Block: features");
      expect(prompt).toContain("Block: cta");
    });

    it("includes descriptions", () => {
      const prompt = generateBlockSchemaPrompt();
      expect(prompt).toContain("Description:");
    });

    it("includes field definitions", () => {
      const prompt = generateBlockSchemaPrompt();
      expect(prompt).toContain("Fields:");
      expect(prompt).toContain("headline");
    });

    it("marks required fields", () => {
      const prompt = generateBlockSchemaPrompt();
      expect(prompt).toContain("required");
    });
  });
});
