import type { Provider } from "../types";
import type { AgentInput, PageStructure, SyncAgent } from "./types";

export const structureSystemPrompt = `You are a page structure planner. Given a brand brief and user request, define the block structure for a landing page.

Available block types:
- hero: Hero section with headline, subheadline, and CTA buttons
- features: Grid of feature items with icon, title, description
- cta: Call-to-action section with headline and button
- text: Text content block for paragraphs

Output ONLY valid JSON matching this schema:
{
  "blocks": [
    { "id": "unique-id", "type": "block-type", "purpose": "what this block should accomplish" }
  ]
}

Guidelines:
- Generate 3-6 blocks for a typical landing page
- Start with a hero block
- End with a cta block
- Use UUIDs for block IDs (e.g., "block-1", "block-2", etc. for simplicity)
- Purpose should guide the copy specialist on what content to generate`;

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

export function parseStructure(json: string): PageStructure {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.blocks)) {
      throw new Error("Invalid structure: blocks must be an array");
    }
    return {
      blocks: parsed.blocks.map((b: { id?: string, type?: string, purpose?: string }, i: number) => ({
        id: b.id ?? `block-${i + 1}`,
        type: b.type ?? "text",
        purpose: b.purpose ?? "",
      })),
    };
  }
  catch {
    return {
      blocks: [
        { id: "block-1", type: "hero", purpose: "introduce the product" },
        { id: "block-2", type: "features", purpose: "highlight key features" },
        { id: "block-3", type: "cta", purpose: "drive conversion" },
      ],
    };
  }
}
