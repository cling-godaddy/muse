import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { createClient, orchestrate, orchestrateSite, refine, resolveFieldAlias, getValidFields, executeEditSection, singleSectionAgent, generateItemAgent, imageAgent, parseImagePlan, calculateCost, type Message, type Provider, type ToolCall, type BrandBrief, type ImageSelection } from "@muse/ai";
import { requireAuth } from "../middleware/auth";
import { createLogger } from "@muse/logger";
import { createMediaClient, createQueryNormalizer, getIamJwt, type MediaClient, type QueryNormalizer } from "@muse/media";
import type { Section, SectionType, FeatureItem, Quote, TeamMember, StatItem, FaqItem } from "@muse/core";
import { sectionNeedsImages, getPreset, getPresetsForType } from "@muse/core";

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
  step?: string
  payload: Record<string, unknown>
  message: string
  options?: Array<{
    id: string
    label: string
    description?: string
  }>
}

chatRoute.post("/refine", async (c) => {
  const { siteId, sections, messages } = await c.req.json<{
    siteId: string
    sections: Section[]
    messages: Message[]
  }>();

  const pendingActions: PendingAction[] = [];
  const updatedSections: Section[] = [];
  const moves: Array<{ sectionId: string, direction: "up" | "down" }> = [];

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

      // Call the PATCH API endpoint to persist the update
      try {
        const token = c.req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
          logger.error("missing_auth_token");
          return { id: call.id, result: { error: "Missing auth token" } };
        }

        const { section: updatedSection } = await executeEditSection({
          siteId,
          sectionId,
          field: resolvedField,
          value,
          authToken: token,
        });

        updatedSections.push(updatedSection);
        logger.info("section_updated", { sectionId, field: resolvedField });

        return {
          id: call.id,
          result: { success: true, section: updatedSection },
        };
      }
      catch (err) {
        logger.error("edit_section_failed", { error: err });
        return {
          id: call.id,
          result: { error: err instanceof Error ? err.message : "Unknown error" },
        };
      }
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

      // Collect the move to be applied by frontend
      moves.push({ sectionId, direction });

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

    if (call.name === "add_section") {
      const { sectionType, preset, index } = call.input as {
        sectionType?: string
        preset?: string
        index?: number
      };

      // Step 1: Need section type
      if (!sectionType) {
        const sectionTypes = [
          { id: "hero", label: "Hero", description: "Large header with headline and call-to-action" },
          { id: "features", label: "Features", description: "Showcase product features in a grid or list" },
          { id: "cta", label: "Call to Action", description: "Drive users to take action" },
          { id: "testimonials", label: "Testimonials", description: "Customer reviews and quotes" },
          { id: "pricing", label: "Pricing", description: "Pricing tables and plans" },
          { id: "faq", label: "FAQ", description: "Frequently asked questions" },
          { id: "gallery", label: "Gallery", description: "Image gallery or portfolio" },
          { id: "stats", label: "Stats", description: "Key metrics and statistics" },
          { id: "contact", label: "Contact", description: "Contact form and information" },
          { id: "about", label: "About", description: "About us or company story" },
          { id: "logos", label: "Logos", description: "Client or partner logos" },
          { id: "subscribe", label: "Subscribe", description: "Newsletter signup form" },
        ];

        logger.info("add_section_select_type", { availableTypes: sectionTypes.length });
        pendingActions.push({
          type: "add_section",
          step: "select_type",
          payload: { index },
          message: "What type of section would you like to add?",
          options: sectionTypes,
        });
        return {
          id: call.id,
          result: { needsConfirmation: true },
        };
      }

      // Step 2: Need preset
      if (!preset) {
        const presets = getPresetsForType(sectionType as SectionType);
        if (presets.length === 0) {
          logger.warn("invalid_section_type", { sectionType });
          return {
            id: call.id,
            result: { error: `Invalid section type: ${sectionType}` },
          };
        }

        logger.info("add_section_select_preset", { sectionType, availablePresets: presets.length });
        pendingActions.push({
          type: "add_section",
          step: "select_preset",
          payload: { sectionType, index },
          message: `Choose a ${sectionType} layout:`,
          options: presets.map(p => ({
            id: p.id,
            label: p.name,
            description: p.description,
          })),
        });
        return {
          id: call.id,
          result: { needsConfirmation: true },
        };
      }

      // Step 3: All params collected, validate preset
      const presetDef = getPreset(preset);
      if (!presetDef) {
        logger.warn("invalid_preset", { preset, sectionType });
        return {
          id: call.id,
          result: { error: `Invalid preset: ${preset}` },
        };
      }

      // Final confirmation
      logger.info("add_section_pending", { sectionType, preset, index });
      pendingActions.push({
        type: "add_section",
        payload: { sectionType, preset, index },
        message: `Add a ${sectionType} section (${presetDef.name})?`,
      });
      return {
        id: call.id,
        result: { needsConfirmation: true },
      };
    }

    return { id: call.id, result: { success: true } };
  };

  const result = await refine({ sections, messages }, getClient(), executeTool);

  // Complete the usage object with cost and model
  const completeUsage = result.usage
    ? {
      input: result.usage.input,
      output: result.usage.output,
      cost: calculateCost("gpt-4o-mini", result.usage.input, result.usage.output),
      model: "gpt-4o-mini",
    }
    : undefined;

  if (result.failedCalls.length > 0) {
    for (const failed of result.failedCalls) {
      logger.warn("refine_tool_failed", { tool: failed.name, error: failed.error });
    }
  }

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
    updatedSections,
    moves,
    pendingActions,
    usage: completeUsage,
  });
});

// helper: extract section summaries for context
function extractSummaries(sections: Section[]): Array<{ type: string, headline?: string, subheadline?: string }> {
  return sections.map((s) => {
    const section = s as unknown as Record<string, unknown>;
    return {
      type: s.type,
      headline: typeof section.headline === "string" ? section.headline : void 0,
      subheadline: typeof section.subheadline === "string" ? section.subheadline : void 0,
    };
  });
}

// helper: lightweight brief derivation from context
function deriveBriefFromContext(siteContext?: { name?: string, description?: string, location?: string }): BrandBrief {
  return {
    targetAudience: siteContext?.description || "general audience",
    brandVoice: ["professional", "friendly"],
    colorDirection: "modern",
    imageryStyle: "clean, modern",
    constraints: [],
  };
}

chatRoute.post("/generate-section", async (c) => {
  const { sectionType, preset, siteContext, existingSections, brief } = await c.req.json<{
    sectionType: string
    preset: string
    siteContext?: { name?: string, description?: string, location?: string }
    existingSections?: Section[]
    brief?: BrandBrief
  }>();

  logger.info("generate_section_request", { sectionType, preset });

  // derive brief if not cached
  const finalBrief = brief ?? deriveBriefFromContext(siteContext);

  // generate section content
  const sectionResult = await singleSectionAgent.run(
    {
      sectionType,
      preset,
      siteContext,
      existingSections: extractSummaries(existingSections ?? []),
      brief: finalBrief,
      prompt: `Generate content for this ${sectionType} section`,
    } as Parameters<typeof singleSectionAgent.run>[0],
    getClient(),
  );

  const parsed = JSON.parse(sectionResult.content) as { section: Record<string, unknown> };
  const section = parsed.section;

  // remap AI-generated ID to proper UUID (matches orchestrator pattern)
  const sectionWithUUID: Record<string, unknown> = { ...section, id: crypto.randomUUID() };

  logger.info("section_generated", { sectionId: sectionWithUUID.id, sectionType: sectionWithUUID.type });

  // generate images if needed
  let images: ImageSelection[] = [];
  if (sectionNeedsImages(sectionType as SectionType)) {
    logger.info("fetching_images", { sectionType });

    try {
      const imagePlanResult = await imageAgent.run(
        {
          prompt: `Image for ${sectionType} section`,
          brief: finalBrief,
          structure: {
            sections: [
              {
                id: sectionWithUUID.id as string,
                type: sectionType,
                preset,
                purpose: (typeof sectionWithUUID.headline === "string" ? sectionWithUUID.headline : "Content") as string,
              },
            ],
          },
          copySections: [
            {
              id: sectionWithUUID.id as string,
              headline: (typeof sectionWithUUID.headline === "string" ? sectionWithUUID.headline : void 0) as string | undefined,
              subheadline: (typeof sectionWithUUID.subheadline === "string" ? sectionWithUUID.subheadline : void 0) as string | undefined,
            },
          ],
        },
        getClient(),
      );

      const plans = parseImagePlan(imagePlanResult.content);
      logger.info("image_plans_generated", { count: plans.length });

      if (plans.length > 0) {
        images = await getMediaClient().executePlan(plans);
        logger.info("images_fetched", { count: images.length });
      }
    }
    catch (err) {
      logger.error("image_generation_failed", { error: err });
      // continue without images - section can still be used
    }
  }

  // Complete the usage object with cost and model
  const modelName = singleSectionAgent.config.model ?? "unknown";
  const completeUsage = sectionResult.usage
    ? {
      input: sectionResult.usage.input,
      output: sectionResult.usage.output,
      cost: calculateCost(
        modelName,
        sectionResult.usage.input,
        sectionResult.usage.output,
      ),
      model: modelName,
    }
    : undefined;

  return c.json({
    section: sectionWithUUID,
    images,
    usage: completeUsage,
  });
});

// Map item types to their corresponding interfaces
type ItemTypeMap = {
  "feature": FeatureItem
  "testimonial": Quote
  "team-member": TeamMember
  "stat": StatItem
  "faq": FaqItem
};

type ItemType = keyof ItemTypeMap;
type GeneratedItem = ItemTypeMap[ItemType];

chatRoute.post("/generate-item", async (c) => {
  const { itemType, sectionContext, siteContext, brief } = await c.req.json<{
    itemType: ItemType
    sectionContext?: {
      preset?: string
      existingItems?: Array<Record<string, unknown>>
    }
    siteContext?: { name?: string, description?: string, location?: string }
    brief?: BrandBrief
  }>();

  logger.info("generate_item_request", { itemType });

  // derive brief if not provided
  const finalBrief = brief ?? deriveBriefFromContext(siteContext);

  // generate item content
  const itemResult = await generateItemAgent.run(
    {
      itemType,
      sectionContext,
      siteContext,
      brief: finalBrief,
      prompt: `Generate a ${itemType} item`,
    } as Parameters<typeof generateItemAgent.run>[0],
    getClient(),
  );

  const parsed = JSON.parse(itemResult.content) as { item: GeneratedItem };
  let finalItem: GeneratedItem = parsed.item;
  logger.info("item_generated", { itemType });

  // Check if this preset requires images (only for feature items)
  if (itemType === "feature") {
    // Type guard: finalItem is FeatureItem within this block
    const featureItem = finalItem as FeatureItem;
    const preset = sectionContext?.preset ? getPreset(sectionContext.preset) : undefined;

    if (preset?.imageRequirements) {
      logger.info("fetching_image_for_item", { preset: preset.id });

      try {
        const imagePlanResult = await imageAgent.run(
          {
            prompt: `Image for ${itemType} item`,
            brief: finalBrief,
            structure: {
              sections: [
                {
                  id: crypto.randomUUID(),
                  type: "features",
                  preset: preset.id,
                  purpose: String(featureItem.title || "Feature"),
                },
              ],
            },
            copySections: [
              {
                id: crypto.randomUUID(),
                headline: String(featureItem.title || undefined),
                subheadline: typeof featureItem.description === "string" ? featureItem.description : undefined,
              },
            ],
          },
          getClient(),
        );

        const plans = parseImagePlan(imagePlanResult.content);
        logger.info("image_plans_generated", { count: plans.length });

        if (plans.length > 0) {
          const images = await getMediaClient().executePlan(plans);
          logger.info("images_fetched", { count: images.length });

          // Apply image to item
          if (images.length > 0 && preset.imageInjection && images[0]?.image) {
            if (preset.imageInjection.field === "image") {
              featureItem.image = images[0].image;
            }
          }
        }
      }
      catch (err) {
        logger.error("image_generation_failed", { error: err });
        // Continue without image - item can still be used
      }
    }

    // Remove null image field so frontend falls back to icon
    if (!featureItem.image) {
      delete featureItem.image;
    }

    finalItem = featureItem;
  }

  // Complete the usage object with cost and model
  const modelName = generateItemAgent.config.model ?? "unknown";
  const completeUsage = itemResult.usage
    ? {
      input: itemResult.usage.input,
      output: itemResult.usage.output,
      cost: calculateCost(
        modelName,
        itemResult.usage.input,
        itemResult.usage.output,
      ),
      model: modelName,
    }
    : undefined;

  return c.json({
    item: finalItem,
    usage: completeUsage,
  });
});
