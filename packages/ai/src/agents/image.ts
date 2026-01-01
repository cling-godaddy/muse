import { createLogger } from "@muse/logger";
import { getMaxImageRequirements, type SectionType } from "@muse/core";
import type { Provider, ResponseSchema } from "../types";
import type { AgentInput, SyncAgent, SyncAgentResult, PageStructure, BrandBrief, ImagePlan, CopySectionContent } from "./types";

const log = createLogger().child({ agent: "image" });

const imagePlanSchema: ResponseSchema = {
  name: "image_plan",
  description: "Array of image search plans for landing page sections",
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            blockId: { type: "string", description: "Section ID to attach image to" },
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

function buildPlanningPrompt(brief: BrandBrief, structure: PageStructure, copySections?: CopySectionContent[]): string {
  const sectionsWithImages = structure.sections
    .map((s) => {
      // Use max requirements for section type to support preset switching
      const req = getMaxImageRequirements(s.type as SectionType);
      if (!req) return null;
      return { section: s, req };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const requirementsSection = sectionsWithImages.length > 0
    ? `IMAGE REQUIREMENTS (one plan item per section):
${sectionsWithImages.map(({ section, req }) =>
  `- ${section.id}: ${req.count} ${req.category} image(s), orientation: ${req.orientation === "mixed" ? "horizontal OR vertical OR square" : req.orientation}`,
).join("\n")}`
    : "No sections require images.";

  return `You are an image curator for landing pages. Generate search queries for the required images.

BRAND BRIEF:
- Target Audience: ${brief.targetAudience}
- Imagery Style: ${brief.imageryStyle}
- Brand Voice: ${brief.brandVoice.join(", ")}

PAGE CONTEXT:
${structure.sections.map((s) => {
  const copy = copySections?.find(c => c.id === s.id);
  const copyLine = copy?.headline
    ? `\n  Headline: "${copy.headline}"${copy.subheadline ? ` | Subheadline: "${copy.subheadline}"` : ""}`
    : "";
  return `- ${s.id} (${s.type}): ${s.purpose}${copyLine}`;
}).join("\n")}

${requirementsSection}

RULES:
- Output exactly ONE plan item per section listed above
- Use the exact category, count, and orientation specified
- Do NOT split sections into multiple plan items
- Search queries should be specific and evocative, using the headline/copy context when available
- Provider: "unsplash" for editorial/lifestyle, "pexels" for objects/products

Return empty items array if no images needed.`;
}

export const imageAgent: SyncAgent = {
  config: {
    name: "image",
    description: "Plans image searches for sections",
  },

  async run(input: AgentInput, provider: Provider): Promise<SyncAgentResult> {
    if (!input.brief || !input.structure) {
      return { content: "[]" };
    }

    const messages = [
      { role: "system" as const, content: buildPlanningPrompt(input.brief, input.structure, input.copySections) },
      { role: "user" as const, content: `Plan images for a page about: ${input.prompt}` },
    ];
    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    const response = await provider.chat({
      messages,
      responseSchema: imagePlanSchema,
    });

    return { content: response.content, usage: response.usage };
  },
};

export function parseImagePlan(json: string, mixedOrientationSections?: Set<string>): ImagePlan[] {
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

    const plans = items.filter(isImagePlan);

    // Mark mixed orientation sections - client.ts handles the parallel fetch
    if (!mixedOrientationSections || mixedOrientationSections.size === 0) {
      return plans;
    }

    return plans.map((item: ImagePlan) =>
      mixedOrientationSections.has(item.blockId)
        ? { ...item, orientation: "mixed" as const }
        : item,
    );
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
