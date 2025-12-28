import type { MediaClient, ImageSelection } from "@muse/media";
import { createLogger, type Logger } from "@muse/logger";
import { getMinimumImages, getImageRequirements } from "@muse/core";
import type { Message, Provider } from "../types";
import { runWithRetry } from "../retry";
import { briefAgent, briefSystemPrompt, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { themeAgent, themeSystemPrompt, parseThemeSelection, type ThemeSelection } from "./theme";
import { imageAgent, parseImagePlan } from "./image";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure, CopyBlockContent } from "./types";

// Strict parsers that throw on failure (for retry logic)
function parseBriefStrict(json: string): BrandBrief {
  const cleaned = json.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.targetAudience || !Array.isArray(parsed.brandVoice)) {
    throw new Error("Missing required fields: targetAudience or brandVoice");
  }
  return {
    targetAudience: parsed.targetAudience,
    brandVoice: parsed.brandVoice,
    colorDirection: parsed.colorDirection ?? "modern, neutral palette",
    imageryStyle: parsed.imageryStyle ?? "clean, professional imagery",
    constraints: parsed.constraints ?? [],
  };
}

function parseStructureStrict(json: string): PageStructure {
  const cleaned = json.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) {
    throw new Error("Invalid structure: blocks must be a non-empty array");
  }
  return {
    blocks: parsed.blocks.map((b: { id?: string, type?: string, preset?: string, purpose?: string }, i: number) => ({
      id: b.id ?? `block-${i + 1}`,
      type: b.type ?? "text",
      preset: b.preset,
      purpose: b.purpose ?? "",
    })),
  };
}

function parseThemeStrict(json: string): ThemeSelection {
  const cleaned = json.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.palette || !parsed.typography) {
    throw new Error("Missing required fields: palette or typography");
  }
  return { palette: parsed.palette, typography: parsed.typography };
}

const BLOCK_REGEX = /\[BLOCK\]([\s\S]*?)\[\/BLOCK\]/g;

function extractCopyBlocks(copyOutput: string): CopyBlockContent[] {
  const results: CopyBlockContent[] = [];
  for (const match of copyOutput.matchAll(BLOCK_REGEX)) {
    const json = match[1];
    if (!json) continue;
    try {
      const block = JSON.parse(json.trim());
      results.push({
        id: block.id,
        headline: block.headline,
        subheadline: block.subheadline,
        itemTitles: block.items?.map((i: { title?: string }) => i.title).filter(Boolean),
      });
    }
    catch { /* skip malformed */ }
  }
  return results;
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

  const briefResult = await runWithRetry(briefAgent, { prompt }, provider, parseBriefStrict);
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
      const result = await runWithRetry(structureAgent, { prompt, brief }, provider, parseStructureStrict);
      const structure = result.data ?? parseStructure(result.raw);
      structureLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { structure, duration: Date.now() - start, retried: result.attempts > 1 };
    })(),
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(themeAgent, { prompt, brief }, provider, parseThemeStrict);
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

  // emit theme marker for existing parser compatibility (uses palette as theme)
  yield `[THEME:${themeResult.selection.palette}]\n`;

  // step 3: generate copy (streaming)
  yield "[AGENT:copy:start]\n";
  const copyStart = Date.now();
  const copyLog = log.child({ agent: "copy" });
  copyLog.debug("context", { brief, structure });

  let copyOutput = "";
  for await (const chunk of copyAgent.run(
    { prompt, messages: input.messages, brief, structure },
    provider,
  )) {
    copyOutput += chunk;
    yield chunk;
  }

  const copyDuration = Date.now() - copyStart;
  copyLog.info("complete", { duration: copyDuration });

  yield `[AGENT:copy:complete]${JSON.stringify({
    duration: copyDuration,
  })}\n`;

  const copyBlocks = extractCopyBlocks(copyOutput);

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
