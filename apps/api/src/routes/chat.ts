import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrateSite, refine, resolveFieldAlias, getValidFields, type Message, type Provider, type ToolCall } from "@muse/ai";
import { requireAuth } from "../middleware/auth";
import { createLogger } from "@muse/logger";
import { createMediaClient, createQueryNormalizer, getIamJwt, type MediaClient, type QueryNormalizer } from "@muse/media";
import type { Section } from "@muse/core";

const logger = createLogger();
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;
let normalizer: QueryNormalizer | null = null;

function getNormalizer(): QueryNormalizer | undefined {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return void 0;

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

function getMediaClient(): MediaClient {
  if (!mediaClient) {
    mediaClient = createMediaClient({
      gettyJwt: getIamJwt,
      normalizer: getNormalizer(),
      logger: logger.child({ agent: "media" }),
    });
  }
  return mediaClient;
}

export const chatRoute = new Hono();

chatRoute.use("/*", requireAuth);

chatRoute.post("/", async (c) => {
  const { messages, stream } = await c.req.json<{
    messages: Message[]
    stream?: boolean
  }>();

  const config = { mediaClient: getMediaClient(), logger };

  if (stream) {
    return streamText(c, async (textStream) => {
      for await (const chunk of orchestrateSite({ messages }, getClient(), { config })) {
        await textStream.write(chunk);
      }
    });
  }

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
