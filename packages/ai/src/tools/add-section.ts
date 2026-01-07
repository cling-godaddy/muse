import type { ToolDefinition } from "../types";

export const addSectionTool: ToolDefinition = {
  name: "add_section",
  description: "Add a new section to the page. When the user asks to add a section without specifying details, call this tool with an empty object {} - the system will present visual options for the user to select from. Do not ask follow-up questions.",
  schema: {
    type: "object",
    properties: {
      sectionType: {
        type: "string",
        description: "Type of section to add (e.g., hero, features, cta, testimonials, team, pricing, faq, gallery, stats, content)",
      },
      preset: {
        type: "string",
        description: "Preset ID for the section layout (e.g., hero-centered, features-grid)",
      },
      index: {
        type: "number",
        description: "Position to insert the section (0 = top of page). Omit to append at the bottom.",
      },
    },
    required: [],
  },
};
