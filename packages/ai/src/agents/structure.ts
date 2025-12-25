import { generateSectionPrompt } from "@muse/core";
import type { Provider } from "../types";
import type { AgentInput, PageStructure, SyncAgent } from "./types";

export function buildStructurePrompt(): string {
  return `You are a page structure planner. Given a brand brief and user request, define the block structure for a landing page.

SECTION TYPES AND PRESETS:
${generateSectionPrompt()}

Output ONLY valid JSON matching this schema:
{
  "blocks": [
    { "id": "unique-id", "type": "section-type", "preset": "preset-id", "purpose": "what this block should accomplish" }
  ]
}

Guidelines:
- Generate 3-6 blocks for a typical landing page
- Start with a hero block
- End with a cta block
- Select presets that match the brand mood and industry
- Use simple IDs like "block-1", "block-2"
- Purpose should guide the copy specialist on what content to generate`;
}

export const structureSystemPrompt = buildStructurePrompt();

export const structureAgent: SyncAgent = {
  config: {
    name: "structure",
    description: "Plans page structure and block layout",
    model: "gpt-4o-mini",
  },

  async run(input: AgentInput, provider: Provider): Promise<string> {
    const briefContext = input.brief
      ? `Brand Brief:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Color Direction: ${input.brief.colorDirection}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
      : "";

    const response = await provider.chat({
      messages: [
        { role: "system", content: structureSystemPrompt },
        { role: "user", content: `${briefContext}\nUser Request: ${input.prompt}` },
      ],
    });

    return response.content;
  },
};

interface RawBlock {
  id?: string
  type?: string
  preset?: string
  purpose?: string
}

export function parseStructure(json: string): PageStructure {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.blocks)) {
      throw new Error("Invalid structure: blocks must be an array");
    }
    return {
      blocks: parsed.blocks.map((b: RawBlock, i: number) => ({
        id: b.id ?? `block-${i + 1}`,
        type: b.type ?? "text",
        preset: b.preset,
        purpose: b.purpose ?? "",
      })),
    };
  }
  catch {
    return {
      blocks: [
        { id: "block-1", type: "hero", preset: "hero-centered", purpose: "introduce the product" },
        { id: "block-2", type: "features", preset: "features-grid-icons", purpose: "highlight key features" },
        { id: "block-3", type: "cta", preset: "cta-centered", purpose: "drive conversion" },
      ],
    };
  }
}
