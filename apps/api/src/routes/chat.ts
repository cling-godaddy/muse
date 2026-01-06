import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrate, orchestrateSite, refine, resolveFieldAlias, getValidFields, type Message, type Provider, type ToolCall } from "@muse/ai";
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
  const { messages, stream, siteContext } = await c.req.json<{
    messages: Message[]
    stream?: boolean
    siteContext?: { name?: string, description?: string, location?: string, siteType?: "landing" | "full" }
  }>();

  const config = { mediaClient: getMediaClient(), logger };
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

interface PendingAction {
  type: string
  payload: Record<string, unknown>
  message: string
}

chatRoute.post("/refine", async (c) => {
  const { sections, messages } = await c.req.json<{
    sections: Section[]
    messages: Message[]
  }>();

  const pendingActions: PendingAction[] = [];

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

    if (call.name === "move_section") {
      const { sectionId, direction } = call.input as {
        sectionId: string
        direction: "up" | "down"
      };

      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        logger.warn("section_not_found", { sectionId });
        return { id: call.id, result: { error: `Section not found: ${sectionId}` } };
      }

      if (section.type === "footer") {
        logger.warn("cannot_move_footer", { sectionId });
        return { id: call.id, result: { error: "Footer sections cannot be moved" } };
      }

      logger.info("move_section", { sectionId, direction });
      return {
        id: call.id,
        result: { success: true, sectionId, direction },
      };
    }

    if (call.name === "delete_section") {
      const { sectionId } = call.input as { sectionId: string };
      const section = sections.find(s => s.id === sectionId);

      if (!section) {
        logger.warn("section_not_found", { sectionId });
        return { id: call.id, result: { error: `Section not found: ${sectionId}` } };
      }

      if (section.type === "navbar") {
        logger.warn("cannot_delete_navbar", { sectionId });
        return { id: call.id, result: { error: "Cannot delete navbar" } };
      }

      if (section.type === "footer") {
        logger.warn("cannot_delete_footer", { sectionId });
        return { id: call.id, result: { error: "Cannot delete footer" } };
      }

      logger.info("delete_section_pending", { sectionId, sectionType: section.type });
      pendingActions.push({
        type: "delete_section",
        payload: { sectionId },
        message: `Delete the ${section.type} section?`,
      });
      return {
        id: call.id,
        result: { needsConfirmation: true },
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

  const transformedToolCalls = result.toolCalls
    .filter(tc => tc.name !== "delete_section") // delete calls go to pendingActions
    .map((tc) => {
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
  if (pendingActions.length > 0) {
    message = ""; // confirmation UI will display the prompt
  }
  else if (result.failedCalls.length > 0 && result.toolCalls.length === 0) {
    message = "I wasn't able to make that change. Could you try rephrasing your request?";
  }
  else if (result.failedCalls.length > 0) {
    message = `${message} (Some changes couldn't be applied)`;
  }

  return c.json({
    message,
    toolCalls: transformedToolCalls,
    pendingActions,
    usage: result.usage,
  });
});
