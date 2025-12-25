import { generateThemePrompt } from "@muse/themes";
import type { Provider } from "../types";
import type { AgentInput, SyncAgent } from "./types";

function buildSystemPrompt(): string {
  return `You are a brand designer. Select the best theme for a landing page.

${generateThemePrompt()}

Output ONLY the theme ID, nothing else.`;
}

export const themeAgent: SyncAgent = {
  config: {
    name: "theme",
    description: "Selects appropriate theme based on brand brief",
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
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: `${briefContext}\nUser Request: ${input.prompt}` },
      ],
    });

    return response.content.trim();
  },
};
