import type { ToolDefinition } from "../types";

export const moveSectionTool: ToolDefinition = {
  name: "move_section",
  description: "Move a section up or down in the page order. Use this to reorder sections when the user asks to rearrange the page layout.",
  schema: {
    type: "object",
    properties: {
      sectionId: {
        type: "string",
        description: "The ID of the section to move",
      },
      direction: {
        type: "string",
        enum: ["up", "down"],
        description: "Direction to move the section (up = towards top of page, down = towards bottom)",
      },
    },
    required: ["sectionId", "direction"],
  },
};
