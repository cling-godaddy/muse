import { generateSectionSchemaPrompt } from "@muse/core";
import type { Provider } from "../types";
import type { AgentInput, SyncAgent, SyncAgentResult } from "./types";
import { copySectionsSchema } from "../schemas";

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
    ? `PAGE STRUCTURE (generate content for these sections in order):
${input.structure.sections.map(s => `- ${s.id} (${s.type}, preset: ${s.preset}): ${s.purpose}`).join("\n")}
`
    : "";

  return `You are a website copywriter. Generate content sections for landing pages.

${briefSection}
${structureSection}
${generateSectionSchemaPrompt()}

Guidelines:
- Use the EXACT section IDs from the structure above
- Include the "preset" field in each section
- Match the brand voice in your copy
- Do NOT include images/backgroundImage - they are added automatically`;
}

export const copyAgent: SyncAgent = {
  config: {
    name: "copy",
    description: "Generates copy and content for sections",
  },

  async run(input: AgentInput, provider: Provider): Promise<SyncAgentResult> {
    const systemPrompt = buildSystemPrompt(input);

    const response = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        ...(input.messages ?? [{ role: "user" as const, content: input.prompt }]),
      ],
      responseSchema: copySectionsSchema,
    });

    return { content: response.content, usage: response.usage };
  },
};
