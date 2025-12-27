import { createLogger } from "@muse/logger";
import { getMaxImageRequirements, type SectionType } from "@muse/core";
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
  const blocksWithImages = structure.blocks
    .map((b) => {
      // Use max requirements for section type to support preset switching
      const req = getMaxImageRequirements(b.type as SectionType);
      if (!req) return null;
      return { block: b, req };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const requirementsSection = blocksWithImages.length > 0
    ? `IMAGE REQUIREMENTS (one plan item per block):
${blocksWithImages.map(({ block, req }) =>
  `- ${block.id}: ${req.count} ${req.category} image(s), orientation: ${req.orientation === "mixed" ? "horizontal OR vertical OR square" : req.orientation}`,
).join("\n")}`
    : "No blocks require images.";

  return `You are an image curator for landing pages. Generate search queries for the required images.

BRAND BRIEF:
- Target Audience: ${brief.targetAudience}
- Imagery Style: ${brief.imageryStyle}
- Brand Voice: ${brief.brandVoice.join(", ")}

PAGE CONTEXT:
${structure.blocks.map(b => `- ${b.id} (${b.type}): ${b.purpose}`).join("\n")}

${requirementsSection}

RULES:
- Output exactly ONE plan item per block listed above
- Use the exact category, count, and orientation specified
- Do NOT split blocks into multiple plan items
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
