import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrate, type Message, type Provider } from "@muse/ai";

let client: Provider | null = null;

function getClient(): Provider {
  if (!client) {
    client = createClient({
      provider: (process.env.AI_PROVIDER as "openai" | "anthropic") ?? "openai",
      openaiKey: process.env.OPENAI_API_KEY,
      anthropicKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export const chatRoute = new Hono();

chatRoute.post("/", async (c) => {
  const { messages, stream } = await c.req.json<{
    messages: Message[]
    stream?: boolean
  }>();

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of orchestrate({ messages }, getClient())) {
        await textStream.write(chunk);
      }
    });
  }

  // non-streaming: collect all chunks
  let content = "";
  for await (const chunk of orchestrate({ messages }, getClient())) {
    content += chunk;
  }
  return c.json({ content });
});
