import { describe, it, expect } from "vitest";
import { SECTION_TYPES } from "@muse/core";
import { copySectionsSchema } from "./schemas";

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
