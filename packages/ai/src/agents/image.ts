import { createLogger } from "@muse/logger";
import { getMaxImageRequirements, getImageRequirements, type SectionType } from "@muse/core";
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
            provider: { type: "string", enum: ["getty"], description: "Image provider" },
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

export function buildPlanningPrompt(brief: BrandBrief, structure: PageStructure, copySections?: CopySectionContent[]): string {
  const sectionsWithImages = structure.sections
    .map((s) => {
      // Use preset-specific requirements if preset is specified, otherwise fall back to max for type
      const req = s.preset
        ? getImageRequirements(s.preset) ?? getMaxImageRequirements(s.type as SectionType)
        : getMaxImageRequirements(s.type as SectionType);
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

  return `You are a Getty Images search specialist for landing pages. Generate SHORT KEYWORD queries (not sentences or phrases).

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

CRITICAL: Generate SHORT KEYWORDS (4-7 words, 1-2 words each). Stock photos show TYPES not SPECIFICS.

CORE PRINCIPLES:

1. SPECIFICITY PARADOX
   Use specific activities from context:
   ✅ Keep: "kung fu", "embroidery", "sushi", "swimming" (when mentioned)
   ❌ Avoid: Generic terms like "activities", "crafts", "food" (too vague)

   BUT generalize ultra-specific cultural identifiers:
   ✅ "Mexican traditional" NOT "Otomi"
   ✅ "South Asian classical" NOT "Kuchipudi"
   ✅ "Japanese traditional" NOT "Edomae-ryu"

2. IDENTITY EXTRACTION (for people images)
   Extract and apply consistently:
   - Cultural/ethnic background: Mexican, Japanese, South Asian, European
   - Diaspora context: "Mexican American", "South Asian Canadian" (preserve if mentioned)
   - Age: child, young, adult, elderly
   - Role: chef, teacher, student, professional

   Transform names to attributes:
   ❌ "Chef Junichiro Saitama" → ✅ "Japanese master chef"
   ❌ "Maria Gonzalez teaching" → ✅ "Mexican American teacher"

3. SEARCHABILITY
   Stock photos work at country/region level:
   ✅ KEEP: Country names, generic activities, common roles
   ❌ REMOVE: Person names, brand names, business names, ultra-specific traditions

4. KEYWORD FORMAT
   - 4-7 keywords total
   - Each keyword: 1-2 words max
   - No sentences, phrases, or filler words (the, a, with)

CATEGORY GUIDANCE:

People: Include identity + action
- Good: "Japanese master chef preparing sushi"
- Good: "South Asian child kung fu swimming"
- Bad: "Chef Junichiro Saitama at work"

Subject/Object: Visual attributes + style
- Good: "elegant sushi presentation traditional style"
- Good: "Mexican traditional embroidery textiles"
- Bad: "Chef Saitama's signature dish Edomae"

Ambient: Setting + atmosphere
- Good: "minimalist Japanese restaurant interior"
- Good: "cozy urban cafe outdoor seating"
- Bad: "Saitama Sushi San Francisco location"

TRANSFORMATION EXAMPLES:
✅ "Chef Junichiro Saitama, Edomae master" → "Japanese master chef traditional sushi"
✅ "Mexican American girl learning Otomi embroidery" → "Mexican American child traditional embroidery"
✅ "Saitama Sushi restaurant interior" → "elegant sushi restaurant minimalist interior"
✅ "Chef's seasonal nigiri platter" → "elegant sushi presentation seasonal ingredients"

TECHNICAL RULES:
- Output exactly ONE plan item per section
- Use exact category, count, orientation specified
- Provider: always use "getty"
- Queries must be 4-7 SHORT keywords

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
      model: "gpt-4o-mini",
      messages,
      responseSchema: imagePlanSchema,
    });

    log.info("image_plan_raw", {
      content: response.content.slice(0, 500),
      model: "gpt-4o-mini",
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
    const finalPlans = !mixedOrientationSections || mixedOrientationSections.size === 0
      ? plans
      : plans.map((item: ImagePlan) =>
        mixedOrientationSections.has(item.blockId)
          ? { ...item, orientation: "mixed" as const }
          : item,
      );

    log.info("image_plan_parsed", {
      plans: finalPlans.map((p: ImagePlan) => ({
        blockId: p.blockId,
        orientation: p.orientation,
        query: p.searchQuery.slice(0, 50),
      })),
    });

    return finalPlans;
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
