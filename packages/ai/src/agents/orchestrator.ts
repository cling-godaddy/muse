import type { MediaClient, ImageSelection } from "@muse/media";
import { createLogger, type Logger } from "@muse/logger";
import { getMinimumImages, getImageRequirements, type Block } from "@muse/core";
import type { Message, Provider } from "../types";
import { runWithRetry } from "../retry";
import { briefAgent, briefSystemPrompt, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { themeAgent, themeSystemPrompt, parseThemeSelection, type ThemeSelection } from "./theme";
import { imageAgent, parseImagePlan } from "./image";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure, CopyBlockContent } from "./types";

// Simple JSON parser for schema-validated responses
function parseJson<T>(json: string): T {
  return JSON.parse(json);
}

// Extract copy block summaries for image agent context
function extractCopyBlockSummaries(blocks: Block[]): CopyBlockContent[] {
  return blocks.map(block => ({
    id: block.id,
    headline: (block as { headline?: string }).headline,
    subheadline: (block as { subheadline?: string }).subheadline,
    itemTitles: (block as { items?: { title?: string }[] }).items
      ?.map(i => i.title)
      .filter((t): t is string => !!t),
  }));
}

export interface OrchestratorInput {
  messages: Message[]
}

export interface OrchestratorConfig {
  mediaClient?: MediaClient
  logger?: Logger
}

export interface OrchestratorEvents {
  onBrief?: (brief: BrandBrief) => void
  onStructure?: (structure: PageStructure) => void
  onTheme?: (theme: ThemeSelection) => void
  onBlocks?: (blocks: Block[]) => void
  onImages?: (images: ImageSelection[]) => void
}

export async function* orchestrate(
  input: OrchestratorInput,
  provider: Provider,
  options?: {
    config?: OrchestratorConfig
    events?: OrchestratorEvents
  },
): AsyncGenerator<string> {
  const { config, events } = options ?? {};
  const log = config?.logger ?? createLogger();
  const userMessage = input.messages.find(m => m.role === "user");
  const prompt = userMessage?.content ?? "";

  // step 1: extract brief
  yield "[AGENT:brief:start]\n";
  const briefStart = Date.now();
  const briefLog = log.child({ agent: "brief" });
  briefLog.debug("system_prompt", { prompt: briefSystemPrompt });
  briefLog.debug("user_input", { prompt });

  const briefResult = await runWithRetry(briefAgent, { prompt }, provider, parseJson<BrandBrief>);
  const brief = briefResult.data ?? parseBrief(briefResult.raw);
  briefLog.debug("raw_response", { response: briefResult.raw, attempts: briefResult.attempts });

  events?.onBrief?.(brief);
  const briefDuration = Date.now() - briefStart;
  briefLog.info("complete", { duration: briefDuration, brief, retried: briefResult.attempts > 1 });
  yield `[AGENT:brief:complete]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
    duration: briefDuration,
  })}\n`;

  // step 2: plan structure + select theme (parallel)
  yield "[AGENT:structure:start]\n";
  yield "[AGENT:theme:start]\n";

  const structureLog = log.child({ agent: "structure" });
  const themeLog = log.child({ agent: "theme" });

  structureLog.debug("starting", { prompt });
  themeLog.debug("system_prompt", { prompt: themeSystemPrompt() });

  const [structureResult, themeResult] = await Promise.all([
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(structureAgent, { prompt, brief }, provider, parseJson<PageStructure>);
      const structure = result.data ?? parseStructure(result.raw);
      structureLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { structure, duration: Date.now() - start, retried: result.attempts > 1 };
    })(),
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(themeAgent, { prompt, brief }, provider, parseJson<ThemeSelection>);
      const selection = result.data ?? parseThemeSelection(result.raw);
      themeLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { selection, duration: Date.now() - start, retried: result.attempts > 1 };
    })(),
  ]);

  const structure = structureResult.structure;
  events?.onStructure?.(structure);
  events?.onTheme?.(themeResult.selection);

  structureLog.info("complete", { duration: structureResult.duration, blockCount: structure.blocks.length });
  themeLog.info("complete", { duration: themeResult.duration, ...themeResult.selection });

  yield `[AGENT:structure:complete]${JSON.stringify({
    blockCount: structure.blocks.length,
    blockTypes: structure.blocks.map(b => b.type),
    duration: structureResult.duration,
  })}\n`;

  yield `[AGENT:theme:complete]${JSON.stringify({
    palette: themeResult.selection.palette,
    typography: themeResult.selection.typography,
    duration: themeResult.duration,
  })}\n`;

  // emit theme marker for existing parser compatibility
  yield `[THEME:${themeResult.selection.palette}]\n`;

  // step 3: generate copy (non-streaming, structured output)
  yield "[AGENT:copy:start]\n";
  const copyStart = Date.now();
  const copyLog = log.child({ agent: "copy" });
  copyLog.debug("context", { brief, structure });

  const copyResult = await copyAgent.run(
    { prompt, messages: input.messages, brief, structure },
    provider,
  );

  const copyDuration = Date.now() - copyStart;
  copyLog.info("complete", { duration: copyDuration });

  // Parse copy result as { blocks: Block[] }
  let blocks: Block[] = [];
  try {
    const parsed = JSON.parse(copyResult) as { blocks: Block[] };
    blocks = parsed.blocks ?? [];
  }
  catch (err) {
    copyLog.warn("parse_failed", { error: String(err), input: copyResult.slice(0, 200) });
  }

  events?.onBlocks?.(blocks);

  yield `[AGENT:copy:complete]${JSON.stringify({
    blockCount: blocks.length,
    duration: copyDuration,
  })}\n`;

  // Emit all blocks at once
  yield `[BLOCKS:${JSON.stringify(blocks)}]\n`;

  // Extract summaries for image agent
  const copyBlocks = extractCopyBlockSummaries(blocks);

  // step 4: plan and resolve images (using copy context)
  let images: ImageSelection[] = [];
  if (config?.mediaClient) {
    yield "[AGENT:image:start]\n";
    const imageStart = Date.now();
    const imageLog = log.child({ agent: "image" });

    const imagePlanJson = await imageAgent.run({ prompt, brief, structure, copyBlocks }, provider);
    imageLog.debug("raw_response", { response: imagePlanJson });

    // Identify blocks that need mixed orientations for masonry-style layouts
    const mixedOrientationBlocks = new Set(
      structure.blocks
        .filter(b => b.preset && getImageRequirements(b.preset)?.orientation === "mixed")
        .map(b => b.id),
    );

    const imagePlan = parseImagePlan(imagePlanJson, mixedOrientationBlocks);
    imageLog.debug("parsed_plan", { plan: imagePlan, mixedBlocks: Array.from(mixedOrientationBlocks) });

    if (imagePlan.length > 0) {
      // Compute minimum image counts per gallery block
      const minPerBlock: Record<string, number> = {};
      for (const block of structure.blocks) {
        if (block.type === "gallery" && block.preset) {
          minPerBlock[block.id] = getMinimumImages(block.preset);
        }
      }

      images = await config.mediaClient.executePlan(imagePlan, { minPerBlock });
      events?.onImages?.(images);
    }

    const imageDuration = Date.now() - imageStart;
    imageLog.info("complete", { duration: imageDuration, planned: imagePlan.length, resolved: images.length });

    yield `[AGENT:image:complete]${JSON.stringify({
      planned: imagePlan.length,
      resolved: images.length,
      duration: imageDuration,
    })}\n`;

    // emit images for client-side injection into blocks
    if (images.length > 0) {
      yield `[IMAGES:${JSON.stringify(images)}]\n`;
    }
  }
}
