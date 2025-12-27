import { generateBlockSchemaPrompt } from "@muse/core";
import type { Provider } from "../types";
import type { Agent, AgentInput, ImageSelection } from "./types";

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

  const images = (input.context?.images ?? []) as ImageSelection[];
  const imageSection = images.length > 0
    ? `AVAILABLE IMAGES (include these in the corresponding blocks):
${images.map((img) => {
  if (img.category === "ambient") {
    return `- Block ${img.blockId}: Add backgroundImage: ${JSON.stringify(img.image)}`;
  }
  return `- Block ${img.blockId} (${img.category}): Use image: ${JSON.stringify(img.image)}`;
}).join("\n")}
`
    : "";

  return `You are a website copywriter. Generate content blocks for landing pages.

${briefSection}
${structureSection}
${imageSection}
${generateBlockSchemaPrompt()}

RESPONSE FORMAT:
Describe what you're creating in natural, conversational language.
Embed each block's JSON in [BLOCK] markers (these are parsed separately, not displayed to users).

Example flow:
Let me create a compelling hero section to capture attention right away...
[BLOCK]
{"id": "hero-1", "type": "hero", "preset": "hero-overlay", "headline": "...", ...}
[/BLOCK]

Now I'll add some features to showcase your key offerings...
[BLOCK]
{"id": "features-1", "type": "features", "preset": "features-grid-icons", "items": [...], ...}
[/BLOCK]

Guidelines:
- Write naturally, as if explaining your creative choices
- Use the block IDs and presets from the structure above
- Include the "preset" field in each block JSON
- Match the brand voice in your copy
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
