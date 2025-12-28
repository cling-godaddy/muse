import OpenAI from "openai";

export interface ImageAnalysis {
  caption: string
  subjects: string[]
  colors: {
    dominant: string[]
  }
  style: string[]
  composition: "centered" | "rule-of-thirds" | "symmetrical" | "asymmetrical" | "other"
  lighting: "natural" | "studio" | "dramatic" | "soft" | "mixed"
  mood: string[]
  context: string[]
  expansions: string[]
}

const analysisSchema = {
  name: "image_analysis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      caption: {
        type: "string",
        description: "Search-optimized description (2-3 sentences). Include: main subject, setting/context, mood, and 2-3 keywords someone would use to find this image. Be specific, not generic.",
      },
      subjects: {
        type: "array",
        items: { type: "string" },
        description: "Main subjects/topics in the image (e.g., food, sushi, japanese cuisine)",
      },
      colors: {
        type: "object",
        properties: {
          dominant: {
            type: "array",
            items: { type: "string" },
            description: "2-4 dominant colors in the image",
          },
        },
        required: ["dominant"],
        additionalProperties: false,
      },
      style: {
        type: "array",
        items: { type: "string" },
        description: "Visual style descriptors (e.g., photography, close-up, professional, minimalist)",
      },
      composition: {
        type: "string",
        enum: ["centered", "rule-of-thirds", "symmetrical", "asymmetrical", "other"],
        description: "Primary composition style",
      },
      lighting: {
        type: "string",
        enum: ["natural", "studio", "dramatic", "soft", "mixed"],
        description: "Lighting style",
      },
      mood: {
        type: "array",
        items: { type: "string" },
        description: "Emotional/aesthetic mood (e.g., elegant, appetizing, fresh, professional)",
      },
      context: {
        type: "array",
        items: { type: "string" },
        description: "Contextual descriptors (e.g., restaurant, fine dining, outdoor, casual)",
      },
      expansions: {
        type: "array",
        items: { type: "string" },
        description: "5-10 related search terms someone might use to find this image",
      },
    },
    required: ["caption", "subjects", "colors", "style", "composition", "lighting", "mood", "context", "expansions"],
    additionalProperties: false,
  },
};

const systemPrompt = `You are an image analyst for a stock photo search system. Your caption determines how this image is found in searches.

CRITICAL: Only describe what you can clearly see. Omission is safer than guessing.

Guidelines:
- Use specific terms only when confident (e.g., "golden retriever" only if clearly identifiable, otherwise "dog")
- Describe the visible setting, not inferred location (e.g., "outdoor seating area" not "Paris cafe")
- Don't extrapolate beyond frame (no "busy street" if you only see a corner)
- When uncertain, use broader categories
- Mention mood/style when clearly evident

Write a 2-3 sentence description covering: main subject, visible setting, and mood/style.`;

export function createImageAnalyzer(apiKey: string) {
  const client = new OpenAI({ apiKey });

  return async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image:" },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: analysisSchema,
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from vision model");
    }

    return JSON.parse(content) as ImageAnalysis;
  };
}

const searchQuerySchema = {
  name: "search_queries",
  strict: true,
  schema: {
    type: "object",
    properties: {
      queries: {
        type: "array",
        items: { type: "string" },
        description: "5 realistic search queries someone might type to find this image",
      },
    },
    required: ["queries"],
    additionalProperties: false,
  },
};

const searchQueryPrompt = `You are simulating how a real user would search for stock photos.

Given an image, generate 5 realistic search queries that someone might type to find it.

Guidelines:
- Use natural, simple language (how real people search, not formal descriptions)
- Vary specificity: some broad ("mountain landscape"), some specific ("snowy mountain peak sunset")
- Include different angles: subject, mood, use case, style
- Think about who would need this image and what they'd type
- Keep queries 2-6 words typically

Examples of good queries for a photo of a golden retriever puppy in a park:
- "golden retriever puppy"
- "cute dog playing outside"
- "puppy in grass"
- "happy dog park"
- "pet photography golden retriever"`;

export function createSearchQueryGenerator(apiKey: string) {
  const client = new OpenAI({ apiKey });

  return async function generateSearchQueries(imageUrl: string): Promise<string[]> {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: searchQueryPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Generate search queries for this image:" },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: searchQuerySchema,
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from vision model");
    }

    const parsed = JSON.parse(content) as { queries: string[] };
    return parsed.queries;
  };
}
