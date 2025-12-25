import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, type Message, type Provider } from "@muse/ai";
import { generateBlockSchemaPrompt } from "@muse/core";
import { generateThemePrompt } from "@muse/themes";

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

const systemPrompt = `You are a website content generator. Generate content blocks for landing pages.

${generateBlockSchemaPrompt()}

${generateThemePrompt()}

RESPONSE FORMAT:
Start with the theme marker, then describe what you're creating in natural language.
Wrap each block's JSON in [BLOCK] markers. Example:

[THEME:corporate]
Creating a professional landing page for your business...

[BLOCK]
{"id": "uuid-here", "type": "hero", "headline": "...", ...}
[/BLOCK]

Adding features to showcase your key offerings...

[BLOCK]
{"id": "uuid-here", "type": "features", "items": [...], ...}
[/BLOCK]

Guidelines:
- Start with [THEME:id] on the first line
- Write 1-2 sentences describing each block before its [BLOCK] marker
- Generate 3-6 blocks total (hero, features, cta, etc.)
- Use UUIDs for block IDs
- Keep descriptions friendly and conversational
- Each block JSON must be valid and complete`;

export const chatRoute = new Hono();

chatRoute.post("/", async (c) => {
  const { messages, stream } = await c.req.json<{
    messages: Message[]
    stream?: boolean
  }>();

  const messagesWithSystem: Message[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of getClient().chatStream({ messages: messagesWithSystem })) {
        await textStream.write(chunk);
      }
    });
  }

  const response = await getClient().chat({ messages: messagesWithSystem });
  return c.json(response);
});
