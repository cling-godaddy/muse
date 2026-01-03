import { describe, it, expect } from "vitest";
import { SECTION_TYPES } from "@muse/core";
import * as schemas from "./schemas";

const { copySectionsSchema } = schemas;

describe("copySectionsSchema", () => {
  it("has a schema for every section type", () => {
    const schema = copySectionsSchema.schema as {
      properties: {
        sections: {
          items: {
            anyOf: Array<{
              properties: {
                type: { const: string }
              }
            }>
          }
        }
      }
    };

    const schemaTypes = schema.properties.sections.items.anyOf
      .map(entry => entry.properties.type.const)
      .filter(Boolean);

    for (const sectionType of SECTION_TYPES) {
      expect(schemaTypes, `missing schema for "${sectionType}"`).toContain(sectionType);
    }
  });
});

/**
 * Validates a JSON schema against OpenAI's strict mode requirements:
 * 1. All properties must be in the required array
 * 2. additionalProperties must be false
 * 3. Nested objects must follow the same rules
 */
function validateOpenAISchema(schema: unknown, path = "root"): string[] {
  const errors: string[] = [];

  if (typeof schema !== "object" || schema === null) return errors;

  const obj = schema as Record<string, unknown>;

  // Check object schemas
  if (obj.type === "object" && obj.properties) {
    const props = obj.properties as Record<string, unknown>;
    const required = (obj.required as string[]) ?? [];
    const propKeys = Object.keys(props);

    // Rule 1: All properties must be in required
    for (const key of propKeys) {
      if (!required.includes(key)) {
        errors.push(`${path}.${key}: property not in required array`);
      }
    }

    // Rule 2: additionalProperties must be false
    if (obj.additionalProperties !== false) {
      errors.push(`${path}: additionalProperties must be false`);
    }

    // Recurse into properties
    for (const [key, value] of Object.entries(props)) {
      errors.push(...validateOpenAISchema(value, `${path}.${key}`));
    }
  }

  // Check arrays
  if (obj.type === "array" && obj.items) {
    errors.push(...validateOpenAISchema(obj.items, `${path}[]`));
  }

  // Check union types (for nullable arrays)
  if (Array.isArray(obj.type) && obj.type.includes("array") && obj.items) {
    errors.push(...validateOpenAISchema(obj.items, `${path}[]`));
  }

  // Check anyOf/oneOf
  if (Array.isArray(obj.anyOf)) {
    obj.anyOf.forEach((variant, i) => {
      errors.push(...validateOpenAISchema(variant, `${path}.anyOf[${i}]`));
    });
  }

  return errors;
}

describe("OpenAI schema compliance", () => {
  const allSchemas = Object.entries(schemas).filter(
    ([, value]) => typeof value === "object" && value !== null && "schema" in value,
  ) as [string, { schema: unknown }][];

  it.each(allSchemas)("%s follows OpenAI strict mode requirements", (name, schema) => {
    const errors = validateOpenAISchema(schema.schema);
    if (errors.length > 0) {
      throw new Error(`Schema ${name} has validation errors:\n${errors.join("\n")}`);
    }
  });
});
