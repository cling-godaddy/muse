import type { ToolDefinition } from "../types";

export const editSectionTool: ToolDefinition = {
  name: "edit_section",
  description:
    "Edit an existing section's content. Use this to update headlines, descriptions, CTAs, items, or any other section fields. Pass only the fields you want to change.",
  schema: {
    type: "object",
    properties: {
      sectionId: {
        type: "string",
        description: "The ID of the section to edit",
      },
      updates: {
        type: "object",
        description:
          "Partial section data to merge. Only include fields you want to change.",
        additionalProperties: true,
      },
    },
    required: ["sectionId", "updates"],
  },
};
