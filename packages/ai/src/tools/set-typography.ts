import type { ToolDefinition } from "../types";

export const setTypographyTool: ToolDefinition = {
  name: "set_typography",
  description: "Change the site's typography (font pairing). Use when the user asks to change fonts, typography, or font style.",
  schema: {
    type: "object",
    properties: {
      typography: {
        type: "string",
        description: "The typography preset ID (e.g., 'inter', 'oswald', 'playfair')",
      },
    },
    required: ["typography"],
  },
};
