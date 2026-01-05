import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, createImageAnalyzer, orchestrateSite, refine, resolveFieldAlias, getValidFields, type Message, type Provider, type ToolCall } from "@muse/ai";
import { requireAuth } from "../middleware/auth";
import { embed } from "@muse/ai/rag";
import { createLogger } from "@muse/logger";
import { createMediaClient, createImageBank, createQueryNormalizer, type MediaClient, type ImageBank, type QueryNormalizer } from "@muse/media";
import type { Section } from "@muse/core";

const logger = createLogger();
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;
let imageBank: ImageBank | null = null;
let imageBankPromise: Promise<ImageBank | null> | null = null;
let normalizer: QueryNormalizer | null = null;

function getNormalizer(): QueryNormalizer | undefined {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return undefined;

  if (!normalizer) {
    normalizer = createQueryNormalizer(openaiKey);
  }
  return normalizer;
}

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
    normalizer: getNormalizer(),
    logger: logger.child({ agent: "media" }),
  });

  return mediaClient;
}

export const chatRoute = new Hono();

chatRoute.use("/*", requireAuth);

chatRoute.post("/", async (c) => {
  const { messages, stream } = await c.req.json<{
    messages: Message[]
    stream?: boolean
  }>();

  const config = { mediaClient: (await getMediaClient()) ?? undefined, logger };

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of orchestrateSite({ messages }, getClient(), { config })) {
        await textStream.write(chunk);
      }
    });
  }

  // non-streaming: collect all chunks
  let content = "";
  for await (const chunk of orchestrateSite({ messages }, getClient(), { config })) {
    content += chunk;
  }
  return c.json({ content });
});

chatRoute.post("/refine", async (c) => {
  const { sections, messages } = await c.req.json<{
    sections: Section[]
    messages: Message[]
  }>();

  // Tool executor with field validation
  // Actual state mutation happens on the frontend
  const executeTool = async (call: ToolCall) => {
    logger.info("tool_call", { name: call.name, input: call.input });

    if (call.name === "edit_section") {
      const { sectionId, field, value } = call.input as {
        sectionId: string
        field: string
        value: unknown
      };

      // Find the section
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        logger.warn("section_not_found", { sectionId });
        return { id: call.id, result: { error: `Section not found: ${sectionId}` } };
      }

      // Resolve field alias to actual field name
      const resolvedField = resolveFieldAlias(section.type, field);
      if (!resolvedField) {
        const validFields = getValidFields(section.type);
        logger.warn("invalid_field", { field, sectionType: section.type, validFields });
        return {
          id: call.id,
          result: { error: `Invalid field "${field}" for ${section.type}. Valid fields: ${validFields.join(", ")}` },
        };
      }

      logger.info("field_resolved", { input: field, resolved: resolvedField });
      return {
        id: call.id,
        result: { success: true, field: resolvedField, value },
      };
    }

    return { id: call.id, result: { success: true } };
  };

  const result = await refine({ sections, messages }, getClient(), executeTool);

  // Log detailed errors for debugging
  if (result.failedCalls.length > 0) {
    for (const failed of result.failedCalls) {
      logger.warn("refine_tool_failed", { tool: failed.name, error: failed.error });
    }
  }

  // Transform successful tool calls to frontend format
  const transformedToolCalls = result.toolCalls.map((tc) => {
    if (tc.name === "edit_section" && tc.input.field) {
      const { sectionId, field, value } = tc.input as { sectionId: string, field: string, value: unknown };
      return {
        name: tc.name,
        input: { sectionId, updates: { [field]: value } },
      };
    }
    return tc;
  });

  // Build user-friendly message
  let message = result.message;
  if (result.failedCalls.length > 0 && result.toolCalls.length === 0) {
    // All calls failed - add friendly error
    message = "I wasn't able to make that change. Could you try rephrasing your request?";
  }
  else if (result.failedCalls.length > 0) {
    // Some calls failed - note partial success
    message = `${message} (Some changes couldn't be applied)`;
  }

  return c.json({
    message,
    toolCalls: transformedToolCalls,
    usage: result.usage,
  });
});
