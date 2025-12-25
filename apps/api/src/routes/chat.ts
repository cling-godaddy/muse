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

Respond with a JSON object:
{
  "theme": "<theme-id>",
  "blocks": [
    { "id": "<uuid>", "type": "<block-type>", ...fields }
  ]
}

Guidelines:
- Select an appropriate theme based on the business/context
- Generate 3-6 blocks for a landing page
- Start with a hero block
- Include features to highlight benefits
- End with a CTA block
- Use UUIDs for block IDs
- Respond with ONLY JSON, no markdown`;

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
