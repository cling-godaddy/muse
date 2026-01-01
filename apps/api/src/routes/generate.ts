import { Hono } from "hono";
import { createClient, type Provider } from "@muse/ai";
import { generateSectionSchemaPrompt, validateSections, type Section } from "@muse/core";
import { generateThemePrompt, getTheme } from "@muse/themes";

let client: Provider | null = null;

function getClient(): Provider {
  if (!client) {
    client = createClient({
      provider: (process.env.AI_PROVIDER as "openai" | "anthropic") ?? "anthropic",
      openaiKey: process.env.OPENAI_API_KEY,
      anthropicKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

const systemPrompt = `You are a website content generator. Generate content sections for landing pages based on user prompts.

${generateSectionSchemaPrompt()}

${generateThemePrompt()}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "theme": "<theme-id>",
  "meta": {
    "title": "Page title",
    "description": "Optional page description"
  },
  "sections": [
    // Array of sections matching the schemas above
    // Each section must have: id (UUID), type, and type-specific fields
  ]
}

Guidelines:
- Select an appropriate theme based on the business/context
- Generate 3-6 sections for a typical landing page
- Start with a hero section for the main message
- Include features to highlight key benefits
- End with a CTA section to drive action
- Use UUIDs for section IDs (e.g., "550e8400-e29b-41d4-a716-446655440000")
- Content should be professional and compelling
- Respond with ONLY the JSON, no markdown or explanation`;

export const generateRoute = new Hono();

generateRoute.post("/page", async (c) => {
  const { prompt } = await c.req.json<{ prompt: string }>();

  if (!prompt) {
    return c.json({ error: "prompt is required" }, 400);
  }

  const response = await getClient().chat({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  let parsed: { theme?: string, meta: { title: string, description?: string }, sections: Section[] };
  try {
    parsed = JSON.parse(response.content);
  }
  catch {
    return c.json({ error: "failed to parse AI response as JSON", raw: response.content }, 500);
  }

  const validation = validateSections(parsed.sections);
  if (!validation.success) {
    return c.json({
      error: "sections failed validation",
      issues: validation.error.issues,
      raw: parsed,
    }, 500);
  }

  const theme = parsed.theme ? getTheme(parsed.theme) : getTheme("modern");

  return c.json({
    theme: theme?.id ?? "modern",
    meta: parsed.meta,
    sections: validation.data,
  });
});
