import { Hono } from "hono";
import { createClient, type Provider } from "@muse/ai";
import { generateBlockSchemaPrompt, validateBlocks, type Block } from "@muse/core";

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

const systemPrompt = `You are a website content generator. Generate content blocks for landing pages based on user prompts.

${generateBlockSchemaPrompt()}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "meta": {
    "title": "Page title",
    "description": "Optional page description"
  },
  "blocks": [
    // Array of blocks matching the schemas above
    // Each block must have: id (UUID), type, and type-specific fields
  ]
}

Guidelines:
- Generate 3-6 blocks for a typical landing page
- Start with a hero block for the main message
- Include features to highlight key benefits
- End with a CTA block to drive action
- Use UUIDs for block IDs (e.g., "550e8400-e29b-41d4-a716-446655440000")
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

  let parsed: { meta: { title: string, description?: string }, blocks: Block[] };
  try {
    parsed = JSON.parse(response.content);
  }
  catch {
    return c.json({ error: "failed to parse AI response as JSON", raw: response.content }, 500);
  }

  const validation = validateBlocks(parsed.blocks);
  if (!validation.success) {
    return c.json({
      error: "blocks failed validation",
      issues: validation.error.issues,
      raw: parsed,
    }, 500);
  }

  return c.json({
    meta: parsed.meta,
    blocks: validation.data,
  });
});
