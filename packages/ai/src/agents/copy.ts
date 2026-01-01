import { generateSectionSchemaPrompt } from "@muse/core";
import type { Provider } from "../types";
import type { AgentInput, SyncAgent, SyncAgentResult } from "./types";
import { copyBlocksSchema } from "../schemas";

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
${input.structure.blocks.map(b => `- ${b.id} (${b.type}, preset: ${b.preset}): ${b.purpose}`).join("\n")}
`
    : "";

  return `You are a website copywriter. Generate content blocks for landing pages.

${briefSection}
${structureSection}
${generateSectionSchemaPrompt()}

Guidelines:
- Use the EXACT block IDs from the structure above
- Include the "preset" field in each block
- Match the brand voice in your copy
- Do NOT include images/backgroundImage - they are added automatically`;
}

export const copyAgent: SyncAgent = {
  config: {
    name: "copy",
    description: "Generates copy and content for blocks",
  },

  async run(input: AgentInput, provider: Provider): Promise<SyncAgentResult> {
    const systemPrompt = buildSystemPrompt(input);

    const response = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        ...(input.messages ?? [{ role: "user" as const, content: input.prompt }]),
      ],
      responseSchema: copyBlocksSchema,
    });

    return { content: response.content, usage: response.usage };
  },
};
