import OpenAI from "openai";

export interface ImageAnalysis {
  caption: string
  subjects: string[]
  colors: {
    dominant: string[]
    mood: "warm" | "cool" | "neutral"
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
        description: "Detailed description of the image (2-3 sentences)",
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
          mood: {
            type: "string",
            enum: ["warm", "cool", "neutral"],
            description: "Overall color temperature",
          },
        },
        required: ["dominant", "mood"],
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

const systemPrompt = `You are an image analyst for a stock photo search system. Analyze images to extract rich metadata that will help match future search queries.

Be specific and descriptive. Think about what search terms someone might use to find this image.

For expansions, generate diverse related search terms - synonyms, broader categories, specific details, and related concepts.`;

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
