import { generatePaletteTypographyPrompt } from "@muse/themes";
import { createLogger } from "@muse/logger";
import type { Provider } from "../types";
import type { AgentInput, SyncAgent } from "./types";
import { themeSchema } from "../schemas";

const log = createLogger().child({ agent: "theme" });

export interface ThemeSelection {
  palette: string
  typography: string
}

export function themeSystemPrompt(): string {
  return `You are a brand designer. Select the best color palette and typography for a landing page.

${generatePaletteTypographyPrompt()}`;
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

    const messages = [
      { role: "system" as const, content: themeSystemPrompt() },
      { role: "user" as const, content: `${briefContext}\nUser Request: ${input.prompt}` },
    ];
    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    const response = await provider.chat({
      messages,
      responseSchema: themeSchema,
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
  catch (err) {
    log.warn("parse_failed", {
      error: String(err),
      input: json.slice(0, 500),
      usingDefaults: true,
    });
    return { palette: "slate", typography: "inter" };
  }
}
