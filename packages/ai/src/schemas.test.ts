import { describe, it, expect } from "vitest";
import { SECTION_TYPES } from "@muse/core";
import { copyBlocksSchema } from "./schemas";

describe("copyBlocksSchema", () => {
  it("has a schema for every section type", () => {
    const schema = copyBlocksSchema.schema as {
      properties: {
        blocks: {
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

    const schemaTypes = schema.properties.blocks.items.anyOf
      .map(entry => entry.properties.type.const)
      .filter(Boolean);

    for (const sectionType of SECTION_TYPES) {
      expect(schemaTypes, `missing schema for "${sectionType}"`).toContain(sectionType);
    }
  });
});
