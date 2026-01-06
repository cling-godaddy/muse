import type { ToolDefinition } from "../types";

export const deleteSectionTool: ToolDefinition = {
  name: "delete_section",
  description: "Delete a section from the page. Only use when user explicitly asks to remove or delete a section.",
  schema: {
    type: "object",
    properties: {
      sectionId: {
        type: "string",
        description: "The ID of the section to delete",
      },
    },
    required: ["sectionId"],
  },
};
