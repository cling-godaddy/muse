import { sectionFieldRegistry, getEditableFields, resolveField } from "@muse/core";
import type { ToolDefinition } from "../types";

// Get list of valid editable field names for a section type
export function getValidFields(sectionType: string): string[] {
  const fields = sectionFieldRegistry[sectionType];
  if (!fields) return [];
  return [...getEditableFields(fields).keys()];
}

// Resolve user input (including aliases) to actual field name
export function resolveFieldAlias(sectionType: string, input: string): string | null {
  const fields = sectionFieldRegistry[sectionType];
  if (!fields) return null;
  return resolveField(fields, input);
}

// Get all aliases for display in error messages
export function getFieldAliases(sectionType: string): Map<string, string[]> {
  const fields = sectionFieldRegistry[sectionType];
  if (!fields) return new Map();
  return getEditableFields(fields);
}

export const editSectionTool: ToolDefinition = {
  name: "edit_section",
  description:
    "Edit a section's content. Use exact field names from the EDITABLE FIELDS list. Common aliases are resolved automatically (e.g., 'subheading' → 'subheadline').",
  schema: {
    type: "object",
    properties: {
      sectionId: {
        type: "string",
        description: "The ID of the section to edit",
      },
      field: {
        type: "string",
        description: "The field name to update (e.g., 'headline', 'subheadline', 'cta')",
      },
      value: {
        description: "The new value for the field",
      },
      itemIndex: {
        type: "number",
        description: "For array fields (items, quotes, plans), the index of the item to update",
      },
    },
    required: ["sectionId", "field", "value"],
  },
};
