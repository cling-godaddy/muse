import { generatePaletteTypographyPrompt } from "@muse/themes";
import type { Provider } from "../types";
import type { AgentInput, SyncAgent } from "./types";

export interface ThemeSelection {
  palette: string
  typography: string
}

export function themeSystemPrompt(): string {
  return `You are a brand designer. Select the best color palette and typography for a landing page.

${generatePaletteTypographyPrompt()}

Output ONLY valid JSON, nothing else.`;
}

export const themeAgent: SyncAgent = {
  config: {
    name: "theme",
    description: "Selects palette and typography based on brand brief",
    model: "gpt-4o-mini",
  },

  async run(input: AgentInput, provider: Provider): Promise<string> {
    const briefContext = input.brief
      ? `Brand Brief:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Color Direction: ${input.brief.colorDirection}
`
      : "";

    const response = await provider.chat({
      messages: [
        { role: "system", content: themeSystemPrompt() },
        { role: "user", content: `${briefContext}\nUser Request: ${input.prompt}` },
      ],
    });

    return response.content.trim();
  },
};

export function parseThemeSelection(json: string): ThemeSelection {
  try {
    const parsed = JSON.parse(json) as ThemeSelection;
    return {
      palette: parsed.palette || "slate",
      typography: parsed.typography || "inter",
    };
  }
  catch {
    return { palette: "slate", typography: "inter" };
  }
}
