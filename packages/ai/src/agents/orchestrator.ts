import type { MediaClient, ImageSelection } from "@muse/media";
import { createLogger, type Logger } from "@muse/logger";
import { getMinimumImages, getImageRequirements, type Section } from "@muse/core";
import type { Message, Provider } from "../types";
import { runWithRetry } from "../retry";
import { calculateCost } from "../pricing";
import { briefAgent, briefSystemPrompt, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { themeAgent, themeSystemPrompt, parseThemeSelection, type ThemeSelection } from "./theme";
import { imageAgent, parseImagePlan } from "./image";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure, CopySectionContent } from "./types";

interface UsageAccumulator {
  input: number
  output: number
}

// Simple JSON parser for schema-validated responses
function parseJson<T>(json: string): T {
  return JSON.parse(json);
}

// Extract copy section summaries for image agent context
function extractCopySectionSummaries(sections: Section[]): CopySectionContent[] {
  return sections.map(section => ({
    id: section.id,
    headline: (section as { headline?: string }).headline,
    subheadline: (section as { subheadline?: string }).subheadline,
    itemTitles: (section as { items?: { title?: string }[] }).items
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
  onSections?: (sections: Section[]) => void
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

  // Track total usage across all agents
  const totalUsage: UsageAccumulator = { input: 0, output: 0 };
  const addUsage = (usage?: { input: number, output: number }) => {
    if (usage) {
      totalUsage.input += usage.input;
      totalUsage.output += usage.output;
    }
  };

  // step 1: extract brief
  yield "[AGENT:brief:start]\n";
  const briefStart = Date.now();
  const briefLog = log.child({ agent: "brief" });
  briefLog.debug("system_prompt", { prompt: briefSystemPrompt });
  briefLog.debug("user_input", { prompt });

  const briefResult = await runWithRetry(briefAgent, { prompt }, provider, parseJson<BrandBrief>);
  const brief = briefResult.data ?? parseBrief(briefResult.raw);
  addUsage(briefResult.usage);
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
      return { structure, duration: Date.now() - start, retried: result.attempts > 1, usage: result.usage };
    })(),
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(themeAgent, { prompt, brief }, provider, parseJson<ThemeSelection>);
      const selection = result.data ?? parseThemeSelection(result.raw);
      themeLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { selection, duration: Date.now() - start, retried: result.attempts > 1, usage: result.usage };
    })(),
  ]);

  const structure = structureResult.structure;
  addUsage(structureResult.usage);
  addUsage(themeResult.usage);
  events?.onStructure?.(structure);
  events?.onTheme?.(themeResult.selection);

  structureLog.info("complete", { duration: structureResult.duration, sectionCount: structure.sections.length });
  themeLog.info("complete", { duration: themeResult.duration, ...themeResult.selection });

  yield `[AGENT:structure:complete]${JSON.stringify({
    sectionCount: structure.sections.length,
    sectionTypes: structure.sections.map(s => s.type),
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
  addUsage(copyResult.usage);

  const copyDuration = Date.now() - copyStart;
  copyLog.info("complete", { duration: copyDuration });

  // Parse copy result as { sections: Section[] }
  let sections: Section[] = [];
  try {
    const parsed = JSON.parse(copyResult.content) as { sections: Section[] };
    sections = parsed.sections ?? [];
  }
  catch (err) {
    copyLog.warn("parse_failed", { error: String(err), input: copyResult.content.slice(0, 200) });
  }

  events?.onSections?.(sections);

  yield `[AGENT:copy:complete]${JSON.stringify({
    sectionCount: sections.length,
    duration: copyDuration,
  })}\n`;

  // Emit all sections at once
  yield `[SECTIONS:${JSON.stringify(sections)}]\n`;

  // Extract summaries for image agent
  const copySections = extractCopySectionSummaries(sections);

  // step 4: plan and resolve images (using copy context)
  let images: ImageSelection[] = [];
  if (config?.mediaClient) {
    yield "[AGENT:image:start]\n";
    const imageStart = Date.now();
    const imageLog = log.child({ agent: "image" });

    const imageResult = await imageAgent.run({ prompt, brief, structure, copySections }, provider);
    addUsage(imageResult.usage);
    imageLog.debug("raw_response", { response: imageResult.content });

    // Identify sections that need mixed orientations for masonry-style layouts
    const mixedOrientationSections = new Set(
      structure.sections
        .filter(s => s.preset && getImageRequirements(s.preset)?.orientation === "mixed")
        .map(s => s.id),
    );

    const imagePlan = parseImagePlan(imageResult.content, mixedOrientationSections);
    imageLog.debug("parsed_plan", { plan: imagePlan, mixedSections: Array.from(mixedOrientationSections) });

    if (imagePlan.length > 0) {
      // Compute minimum image counts per gallery section
      const minPerSection: Record<string, number> = {};
      for (const section of structure.sections) {
        if (section.type === "gallery" && section.preset) {
          minPerSection[section.id] = getMinimumImages(section.preset);
        }
      }

      images = await config.mediaClient.executePlan(imagePlan, { minPerSection });
      events?.onImages?.(images);
    }

    const imageDuration = Date.now() - imageStart;
    imageLog.info("complete", { duration: imageDuration, planned: imagePlan.length, resolved: images.length });

    yield `[AGENT:image:complete]${JSON.stringify({
      planned: imagePlan.length,
      resolved: images.length,
      duration: imageDuration,
    })}\n`;

    // emit images for client-side injection into sections
    if (images.length > 0) {
      yield `[IMAGES:${JSON.stringify(images)}]\n`;
    }
  }

  // Emit total usage for cost tracking
  const model = provider.name === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
  yield `[USAGE:${JSON.stringify({
    input: totalUsage.input,
    output: totalUsage.output,
    cost: calculateCost(model, totalUsage.input, totalUsage.output),
    model,
  })}]\n`;
}
