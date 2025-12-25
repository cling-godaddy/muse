import { generateBlockSchemaPrompt } from "@muse/core";
import { generateThemePrompt } from "@muse/themes";
import type { Provider } from "../types";
import type { Agent, AgentInput } from "./types";

function buildSystemPrompt(input: AgentInput): string {
  const briefSection = input.brief
    ? `BRAND BRIEF:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Color Direction: ${input.brief.colorDirection}
- Imagery Style: ${input.brief.imageryStyle}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
    : "";

  const structureSection = input.structure
    ? `PAGE STRUCTURE (generate content for these blocks in order):
${input.structure.blocks.map(b => `- ${b.id} (${b.type}): ${b.purpose}`).join("\n")}
`
    : "";

  return `You are a website copywriter. Generate content blocks for landing pages.

${briefSection}
${structureSection}
${generateBlockSchemaPrompt()}

${generateThemePrompt()}

RESPONSE FORMAT:
Start with the theme marker, then describe what you're creating in natural language.
Wrap each block's JSON in [BLOCK] markers.

[THEME:theme-id]
Brief description of what you're creating...

[BLOCK]
{"id": "block-id-from-structure", "type": "...", ...content fields...}
[/BLOCK]

Guidelines:
- Use the block IDs from the structure above
- Match the brand voice in your copy
- Write compelling, conversion-focused content
- Keep descriptions friendly and conversational
- Each block JSON must be valid and complete`;
}

export const copyAgent: Agent = {
  config: {
    name: "copy",
    description: "Generates copy and content for blocks",
  },

  async* run(input: AgentInput, provider: Provider): AsyncGenerator<string> {
    const systemPrompt = buildSystemPrompt(input);

    for await (const chunk of provider.chatStream({
      messages: [
        { role: "system", content: systemPrompt },
        ...(input.messages ?? [{ role: "user" as const, content: input.prompt }]),
      ],
    })) {
      yield chunk;
    }
  },
};
