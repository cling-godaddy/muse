import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, createImageAnalyzer, orchestrate, type Message, type Provider } from "@muse/ai";
import { embed } from "@muse/ai/rag";
import { createLogger } from "@muse/logger";
import { createMediaClient, createImageBank, type MediaClient, type ImageBank } from "@muse/media";

const logger = createLogger();
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;
let imageBank: ImageBank | null = null;
let imageBankPromise: Promise<ImageBank | null> | null = null;

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

async function getImageBank(): Promise<ImageBank | null> {
  if (imageBank) return imageBank;
  if (imageBankPromise) return imageBankPromise;

  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!bucket || !region) {
    logger.debug("bank_disabled", { reason: "S3_BUCKET or AWS_REGION not set" });
    return null;
  }

  if (!openaiKey) {
    logger.debug("bank_disabled", { reason: "OPENAI_API_KEY not set (needed for vision analysis)" });
    return null;
  }

  const analyze = createImageAnalyzer(openaiKey);

  imageBankPromise = createImageBank({
    bucket,
    region,
    embed,
    analyze,
    logger: logger.child({ agent: "bank" }),
  }).then((bank) => {
    imageBank = bank;
    return bank;
  }).catch((err) => {
    logger.error("bank_init_failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  });

  return imageBankPromise;
}

async function getMediaClient(): Promise<MediaClient | null> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!unsplashKey && !pexelsKey) {
    return null;
  }

  const bank = await getImageBank();

  // Recreate client if bank became available
  if (mediaClient && !bank) return mediaClient;

  mediaClient = createMediaClient({
    unsplashKey,
    pexelsKey,
    bank: bank ?? undefined,
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

  const config = { mediaClient: (await getMediaClient()) ?? undefined, logger };

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
