import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrate, type Message, type Provider } from "@muse/ai";
import { createLogger } from "@muse/logger";
import { createMediaClient, type MediaClient } from "@muse/media";

const logger = createLogger();
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;

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

function getMediaClient(): MediaClient | null {
  if (mediaClient) return mediaClient;

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!unsplashKey && !pexelsKey) {
    return null;
  }

  mediaClient = createMediaClient({
    unsplashKey,
    pexelsKey,
    logger: logger.child({ agent: "media" }),
  });

  return mediaClient;
}

export const chatRoute = new Hono();

chatRoute.post("/", async (c) => {
  const { messages, stream } = await c.req.json<{
    messages: Message[]
    stream?: boolean
  }>();

  const config = { mediaClient: getMediaClient() ?? undefined, logger };

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of orchestrate({ messages }, getClient(), { config })) {
        await textStream.write(chunk);
      }
    });
  }

  // non-streaming: collect all chunks
  let content = "";
  for await (const chunk of orchestrate({ messages }, getClient(), { config })) {
    content += chunk;
  }
  return c.json({ content });
});
