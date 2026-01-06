import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrate, orchestrateSite, refine, resolveFieldAlias, getValidFields, createImageAnalyzer, embed, type Message, type Provider, type ToolCall } from "@muse/ai";
import { requireAuth } from "../middleware/auth";
import { createLogger } from "@muse/logger";
import { createMediaClient, createQueryNormalizer, createImageBank, getIamJwt, type MediaClient, type QueryNormalizer, type ImageBank, type ImageMetadata } from "@muse/media";
import type { Section } from "@muse/core";

const logger = createLogger();
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;
let normalizer: QueryNormalizer | null = null;
let imageBank: ImageBank | null = null;

function getNormalizer(): QueryNormalizer | undefined {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return void 0;

  if (!normalizer) {
    normalizer = createQueryNormalizer(openaiKey);
  }
  return normalizer;
}

async function getImageBank(): Promise<ImageBank | undefined> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const bucket = process.env.BANK_S3_BUCKET;
  const region = process.env.AWS_REGION ?? "us-west-2";

  if (!openaiKey || !bucket) return void 0;

  if (!imageBank) {
    const analyzer = createImageAnalyzer(openaiKey);
    imageBank = await createImageBank({
      bucket,
      region,
      logger: logger.child({ agent: "bank" }),
      embed: async (text: string) => Array.from(await embed(text)),
      analyze: async (url: string): Promise<ImageMetadata> => {
        const result = await analyzer(url);
        return {
          caption: result.caption,
          subjects: result.subjects,
          style: result.style.join(", "),
          mood: result.mood.join(", "),
        };
      },
    });
    await imageBank.load();
    logger.info("image_bank_initialized", { bucket, region });
  }
  return imageBank;
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

async function getMediaClient(): Promise<MediaClient> {
  if (!mediaClient) {
    const bank = await getImageBank();
    mediaClient = createMediaClient({
      gettyJwt: getIamJwt,
      normalizer: getNormalizer(),
      logger: logger.child({ agent: "media" }),
      bank,
    });
  }
  return mediaClient;
}

export const chatRoute = new Hono();

chatRoute.use("/*", requireAuth);

chatRoute.post("/", async (c) => {
  const { messages, stream, siteContext } = await c.req.json<{
    messages: Message[]
    stream?: boolean
    siteContext?: { name?: string, description?: string, location?: string, siteType?: "landing" | "full" }
  }>();

  const config = { mediaClient: await getMediaClient(), logger };
  const input = { messages, siteContext };

  // use single-page orchestrator for landing pages, multi-page for full sites
  const generator = siteContext?.siteType === "full" ? orchestrateSite : orchestrate;

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of generator(input, getClient(), { config })) {
        await textStream.write(chunk);
      }
    });
  }

  let content = "";
  for await (const chunk of generator(input, getClient(), { config })) {
    content += chunk;
  }
  return c.json({ content });
});

chatRoute.post("/refine", async (c) => {
  const { sections, messages } = await c.req.json<{
    sections: Section[]
    messages: Message[]
  }>();

  const executeTool = async (call: ToolCall) => {
    logger.info("tool_call", { name: call.name, input: call.input });

    if (call.name === "edit_section") {
      const { sectionId, field, value } = call.input as {
        sectionId: string
        field: string
        value: unknown
      };

      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        logger.warn("section_not_found", { sectionId });
        return { id: call.id, result: { error: `Section not found: ${sectionId}` } };
      }

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

  if (result.failedCalls.length > 0) {
    for (const failed of result.failedCalls) {
      logger.warn("refine_tool_failed", { tool: failed.name, error: failed.error });
    }
  }

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

  let message = result.message;
  if (result.failedCalls.length > 0 && result.toolCalls.length === 0) {
    message = "I wasn't able to make that change. Could you try rephrasing your request?";
  }
  else if (result.failedCalls.length > 0) {
    message = `${message} (Some changes couldn't be applied)`;
  }

  return c.json({
    message,
    toolCalls: transformedToolCalls,
    usage: result.usage,
  });
});
