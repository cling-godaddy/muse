import type { Provider, ResponseSchema } from "../types";
import type { AgentInput, SyncAgent, SyncAgentResult, BrandBrief } from "./types";

interface ItemGenerationInput extends AgentInput {
  itemType: "feature" | "testimonial" | "team-member" | "stat" | "faq"
  siteContext?: {
    name?: string
    description?: string
    location?: string
  }
  sectionContext?: {
    preset?: string
    existingItems?: Array<{
      title?: string
      description?: string
      name?: string
      role?: string
      quote?: string
    }>
  }
  brief?: BrandBrief
}

function buildSystemPrompt(input: ItemGenerationInput): string {
  const siteContextSection = input.siteContext
    ? `SITE CONTEXT:
- Name: ${input.siteContext.name || "Not provided"}
- Description: ${input.siteContext.description || "Not provided"}
- Location: ${input.siteContext.location || "Not provided"}
`
    : "";

  const briefSection = input.brief
    ? `BRAND BRIEF:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
    : "";

  const existingItemsSection
    = input.sectionContext?.existingItems && input.sectionContext.existingItems.length > 0
      ? `EXISTING ITEMS (for consistency and coherence):
${input.sectionContext.existingItems.map((item, i) => {
  if (input.itemType === "feature") {
    return `${i + 1}. "${item.title}" - ${item.description}`;
  }
  else if (input.itemType === "team-member") {
    return `${i + 1}. ${item.name} - ${item.role}`;
  }
  else if (input.itemType === "testimonial") {
    return `${i + 1}. "${item.quote}" - ${item.name}`;
  }
  return `${i + 1}. ${item.title || item.name}`;
}).join("\n")}
`
      : "";

  const itemTypeGuidance = {
    "feature": `Generate a feature that:
- Complements existing features without duplicating functionality
- Maintains similar tone and length as existing items
- Highlights a specific benefit or capability
- Uses clear, action-oriented language
- Title should be 3-8 words, description 80-150 characters`,

    "team-member": `Generate a team member that:
- Fits the organizational structure shown in existing members
- Uses realistic names and professional roles
- Maintains similar level of seniority/specificity as existing items
- Role should be specific (not generic like "Employee")`,

    "testimonial": `Generate a testimonial that:
- Sounds authentic and specific (not generic praise)
- Mentions concrete benefits or results when possible
- Matches the tone and length of existing testimonials
- Uses a realistic name and context`,

    "stat": `Generate a statistic that:
- Relates to the business/product value proposition
- Uses realistic, specific numbers (avoid round numbers like 100%)
- Has a clear, concise label
- Complements existing stats without duplication`,

    "faq": `Generate an FAQ item that:
- Addresses a common question users would have
- Provides a clear, helpful answer
- Matches the tone of existing FAQs
- Avoids duplicating topics already covered`,
  };

  return `You are a content generator for website sections.

${siteContextSection}
${briefSection}
${existingItemsSection}
ITEM TO GENERATE:
- Type: ${input.itemType}
- Context: ${input.sectionContext?.preset || "Not provided"}

${itemTypeGuidance[input.itemType]}

Return ONLY valid JSON matching the schema for this item type.
DO NOT include icon/image fields - they are added automatically.`;
}

// Define schemas for each item type
function getItemSchema(itemType: string): ResponseSchema {
  const schemas: Record<string, ResponseSchema> = {
    "feature": {
      name: "feature_item",
      schema: {
        type: "object",
        properties: {
          item: {
            type: "object",
            properties: {
              icon: { type: ["string", "null"] },
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["icon", "title", "description"],
            additionalProperties: false,
          },
        },
        required: ["item"],
        additionalProperties: false,
      },
    },
    "team-member": {
      name: "team_member_item",
      schema: {
        type: "object",
        properties: {
          item: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              avatar: { type: ["string", "null"] },
              bio: { type: ["string", "null"] },
            },
            required: ["name", "role", "avatar", "bio"],
            additionalProperties: false,
          },
        },
        required: ["item"],
        additionalProperties: false,
      },
    },
    "testimonial": {
      name: "testimonial_item",
      schema: {
        type: "object",
        properties: {
          item: {
            type: "object",
            properties: {
              quote: { type: "string" },
              name: { type: "string" },
              role: { type: ["string", "null"] },
              company: { type: ["string", "null"] },
              avatar: { type: ["string", "null"] },
            },
            required: ["quote", "name", "role", "company", "avatar"],
            additionalProperties: false,
          },
        },
        required: ["item"],
        additionalProperties: false,
      },
    },
    "stat": {
      name: "stat_item",
      schema: {
        type: "object",
        properties: {
          item: {
            type: "object",
            properties: {
              value: { type: "string" },
              label: { type: "string" },
            },
            required: ["value", "label"],
            additionalProperties: false,
          },
        },
        required: ["item"],
        additionalProperties: false,
      },
    },
    "faq": {
      name: "faq_item",
      schema: {
        type: "object",
        properties: {
          item: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
            required: ["question", "answer"],
            additionalProperties: false,
          },
        },
        required: ["item"],
        additionalProperties: false,
      },
    },
  };

  const schema = schemas[itemType];
  if (!schema) {
    throw new Error(`Unknown item type: ${itemType}`);
  }
  return schema;
}

export const generateItemAgent: SyncAgent = {
  config: {
    name: "generate-item",
    description: "Generates a single item for a section (feature, testimonial, team member, etc.)",
  },

  async run(input: ItemGenerationInput, provider: Provider): Promise<SyncAgentResult> {
    const systemPrompt = buildSystemPrompt(input);
    const schema = getItemSchema(input.itemType);

    const response = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.prompt || `Generate a ${input.itemType} item` },
      ],
      responseSchema: schema,
      model: "gpt-4o-mini", // fast + cheap for single items
    });

    return { content: response.content, usage: response.usage };
  },
};
