import { createLogger } from "@muse/logger";
import type { Provider } from "../types";
import type { AgentInput, BrandBrief, SyncAgent } from "./types";

const log = createLogger().child({ agent: "brief" });

export const briefSystemPrompt = `You are a brand analyst. Extract a concise brand brief from the user's request.

Output ONLY valid JSON matching this schema:
{
  "targetAudience": "who the site is for",
  "brandVoice": ["adjective1", "adjective2", "adjective3"],
  "colorDirection": "color palette guidance",
  "imageryStyle": "visual style guidance",
  "constraints": ["any specific requirements mentioned"]
}

Examples:
- "a landing page for my saas startup" → targetAudience: "startup founders and tech professionals"
- "modern and minimal" → brandVoice: ["modern", "minimal", "clean"]
- "blue and professional" → colorDirection: "blues, professional corporate palette"

Be concise. Extract what's stated or strongly implied. Use sensible defaults for unspecified aspects.`;

export const briefAgent: SyncAgent = {
  config: {
    name: "brief",
    description: "Extracts brand brief from user prompt",
    model: "gpt-4o-mini",
  },

  async run(input: AgentInput, provider: Provider): Promise<string> {
    const messages = [
      { role: "system" as const, content: briefSystemPrompt },
      { role: "user" as const, content: input.prompt },
    ];
    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    const response = await provider.chat({
      messages,
      jsonMode: true,
    });

    return response.content;
  },
};

export function parseBrief(json: string): BrandBrief {
  try {
    const parsed = JSON.parse(json);
    return {
      targetAudience: parsed.targetAudience ?? "general audience",
      brandVoice: parsed.brandVoice ?? ["professional", "friendly"],
      colorDirection: parsed.colorDirection ?? "modern, neutral palette",
      imageryStyle: parsed.imageryStyle ?? "clean, professional imagery",
      constraints: parsed.constraints ?? [],
    };
  }
  catch (err) {
    log.warn("parse_failed", {
      error: String(err),
      input: json.slice(0, 500),
      usingDefaults: true,
    });
    return {
      targetAudience: "general audience",
      brandVoice: ["professional", "friendly"],
      colorDirection: "modern, neutral palette",
      imageryStyle: "clean, professional imagery",
      constraints: [],
    };
  }
}
