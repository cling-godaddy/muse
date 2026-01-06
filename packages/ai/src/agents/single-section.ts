import { generateSectionSchemaPrompt } from "@muse/core";
import type { Provider, ResponseSchema } from "../types";
import type { AgentInput, SyncAgent, SyncAgentResult, BrandBrief } from "./types";
import { copySectionsSchema } from "../schemas";

interface SingleSectionInput extends AgentInput {
  sectionType: string
  preset: string
  siteContext?: {
    name?: string
    description?: string
    location?: string
  }
  existingSections?: Array<{
    type: string
    headline?: string
    subheadline?: string
  }>
  brief?: BrandBrief
}

function buildSystemPrompt(input: SingleSectionInput): string {
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
- Color Direction: ${input.brief.colorDirection}
- Imagery Style: ${input.brief.imageryStyle}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
    : "";

  const existingSectionsSection
    = input.existingSections && input.existingSections.length > 0
      ? `EXISTING SECTIONS (for context/alignment):
${input.existingSections.map(s => `- ${s.type}: "${s.headline || "No headline"}"`).join("\n")}
`
      : "";

  return `You are a website copywriter. Generate content for a single section.

${siteContextSection}
${briefSection}
${existingSectionsSection}
SECTION TO GENERATE:
- Type: ${input.sectionType}
- Preset: ${input.preset}

${generateSectionSchemaPrompt()}

Guidelines:
- Generate compelling, engaging copy
- Match the brand voice if provided
- Align with existing content tone and style
- DO NOT include images/backgroundImage - they are added automatically
- Use the EXACT section type schema for ${input.sectionType}
- For menu sections: use flat "items" array for menu-cards preset, use "categories" for menu-list preset`;
}

// Extract single section schema from copySectionsSchema
function getSingleSectionSchema(): ResponseSchema {
  // Reuse the section definitions from copySectionsSchema
  const properties = copySectionsSchema.schema.properties as Record<string, { items?: unknown }>;
  const sectionsItems = properties.sections?.items;

  return {
    name: "single_section",
    schema: {
      type: "object",
      properties: {
        section: sectionsItems,
      },
      required: ["section"],
      additionalProperties: false,
    },
  };
}

export const singleSectionAgent: SyncAgent = {
  config: {
    name: "single-section",
    description: "Generates content for a single section",
  },

  async run(input: SingleSectionInput, provider: Provider): Promise<SyncAgentResult> {
    const systemPrompt = buildSystemPrompt(input);
    const schema = getSingleSectionSchema();

    const response = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.prompt || `Generate content for this ${input.sectionType} section` },
      ],
      responseSchema: schema,
      model: "gpt-4o-mini", // fast + cheap for single sections
    });

    return { content: response.content, usage: response.usage };
  },
};
