import { createLogger } from "@muse/logger";
import type { JsonSchema, Provider } from "../types";
import type { AgentInput, SyncAgent, PageStructure, BrandBrief, ImagePlan } from "./types";

const log = createLogger().child({ agent: "image" });

const imagePlanSchema: JsonSchema = {
  name: "image_plan",
  description: "Array of image search plans for landing page blocks",
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            blockId: { type: "string", description: "Block ID to attach image to" },
            category: { type: "string", enum: ["ambient", "subject", "people"], description: "Image category: ambient (backgrounds/textures), subject (main content), people (portraits/teams)" },
            provider: { type: "string", enum: ["unsplash", "pexels"], description: "Image provider" },
            searchQuery: { type: "string", description: "Search query for the image" },
            orientation: { type: "string", enum: ["horizontal", "vertical", "square"], description: "Image orientation" },
            count: { type: "number", description: "Number of images needed (default 1)" },
          },
          required: ["blockId", "category", "provider", "searchQuery", "orientation", "count"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
};

function buildPlanningPrompt(brief: BrandBrief, structure: PageStructure): string {
  return `You are an image curator for landing pages. Given a brand brief and page structure, plan which blocks need images and what to search for.

BRAND BRIEF:
- Target Audience: ${brief.targetAudience}
- Imagery Style: ${brief.imageryStyle}
- Brand Voice: ${brief.brandVoice.join(", ")}

PAGE STRUCTURE:
${structure.blocks.map(b => `- ${b.id} (${b.type}, preset: ${b.preset}): ${b.purpose}`).join("\n")}

IMAGE CATEGORIES:
- "ambient": backgrounds, textures, mood shots (hero backgrounds, section dividers)
- "subject": main content, objects, scenes (feature images, product shots)
- "people": portraits, teams, human subjects (team sections, testimonials)

RULES:
- Hero blocks: category "ambient", orientation "horizontal", count 1
- Gallery blocks: category "subject", mixed orientations, count 4-6
- Feature blocks: category "subject", count 1 per feature if appropriate
- Team sections: category "people", count based on team size
- Testimonials: category "people" for single testimonial, skip for grids/carousels
- Only add images where they enhance the message
- Search queries should be specific and evocative
- Provider: "unsplash" for editorial/lifestyle, "pexels" for objects/products

Return empty items array if no images needed.`;
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

    const messages = [
      { role: "system" as const, content: buildPlanningPrompt(input.brief, input.structure) },
      { role: "user" as const, content: `Plan images for a page about: ${input.prompt}` },
    ];
    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    const response = await provider.chat({
      messages,
      responseSchema: imagePlanSchema,
    });

    return response.content;
  },
};

export function parseImagePlan(json: string): ImagePlan[] {
  try {
    const cleaned = json.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);
    // Handle: {items: [...]}, bare array [...], wrapped {"plan": [...]}, or single object {...}
    const items = Array.isArray(parsed.items)
      ? parsed.items
      : Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.plan)
          ? parsed.plan
          : (parsed.blockId ? [parsed] : []);
    if (items.length === 0) return [];

    function isImagePlan(item: unknown): item is ImagePlan {
      if (!item || typeof item !== "object") return false;
      const obj = item as Record<string, unknown>;
      return typeof obj.blockId === "string"
        && typeof obj.category === "string"
        && typeof obj.provider === "string"
        && typeof obj.searchQuery === "string"
        && typeof obj.orientation === "string";
    }

    return items.filter(isImagePlan);
  }
  catch (err) {
    log.warn("parse_failed", {
      error: String(err),
      input: json.slice(0, 500),
      usingDefaults: true,
    });
    return [];
  }
}
