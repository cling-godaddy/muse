import type { Provider } from "../types";
import type { AgentInput, SyncAgent, PageStructure, BrandBrief, ImagePlan } from "./types";

function buildPlanningPrompt(brief: BrandBrief, structure: PageStructure): string {
  return `You are an image curator for landing pages. Given a brand brief and page structure, plan which blocks need images and what to search for.

BRAND BRIEF:
- Target Audience: ${brief.targetAudience}
- Imagery Style: ${brief.imageryStyle}
- Brand Voice: ${brief.brandVoice.join(", ")}

PAGE STRUCTURE:
${structure.blocks.map(b => `- ${b.id} (${b.type}): ${b.purpose}`).join("\n")}

For each block that would benefit from an image, output a plan.

RULES:
- Hero blocks: Consider background images (horizontal orientation)
- Feature blocks: Consider small images per feature item if appropriate
- Only add images where they enhance the message
- Search queries should be specific and evocative
- Choose provider based on content type:
  - "unsplash" for editorial, lifestyle, abstract backgrounds
  - "pexels" for objects, products, specific scenes

OUTPUT FORMAT (JSON array only, no markdown):
[
  { "blockId": "...", "placement": "background|content|feature", "provider": "unsplash|pexels", "searchQuery": "...", "orientation": "horizontal|vertical|square" }
]

If no images are needed, output: []`;
}

export const imageAgent: SyncAgent = {
  config: {
    name: "image",
    description: "Plans image searches for blocks",
  },

  async run(input: AgentInput, provider: Provider): Promise<string> {
    if (!input.brief || !input.structure) {
      return "[]";
    }

    const response = await provider.chat({
      messages: [
        { role: "system", content: buildPlanningPrompt(input.brief, input.structure) },
        { role: "user", content: `Plan images for a page about: ${input.prompt}` },
      ],
    });

    return response.content;
  },
};

export function parseImagePlan(json: string): ImagePlan[] {
  try {
    const cleaned = json.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ImagePlan =>
      typeof item.blockId === "string"
      && typeof item.placement === "string"
      && typeof item.provider === "string"
      && typeof item.searchQuery === "string"
      && typeof item.orientation === "string",
    );
  }
  catch {
    return [];
  }
}
