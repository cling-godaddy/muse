import type { MediaClient, ImageSelection } from "@muse/media";
import { createLogger, type Logger } from "@muse/logger";
import type { Message, Provider } from "../types";
import { briefAgent, briefSystemPrompt, parseBrief } from "./brief";
import { structureAgent, structureSystemPrompt, parseStructure } from "./structure";
import { themeAgent, themeSystemPrompt, parseThemeSelection, type ThemeSelection } from "./theme";
import { imageAgent, parseImagePlan } from "./image";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure } from "./types";

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

  const briefJson = await briefAgent.run({ prompt }, provider);
  briefLog.debug("raw_response", { response: briefJson });

  const brief = parseBrief(briefJson);
  events?.onBrief?.(brief);
  const briefDuration = Date.now() - briefStart;
  briefLog.info("complete", { duration: briefDuration, brief });
  yield `[AGENT:brief:complete]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
    duration: briefDuration,
  })}\n`;

  // step 2: plan structure + select theme (parallel)
  yield "[AGENT:structure:start]\n";
  yield "[AGENT:theme:start]\n";

  const structureLog = log.child({ agent: "structure" });
  const themeLog = log.child({ agent: "theme" });

  structureLog.debug("system_prompt", { prompt: structureSystemPrompt });
  themeLog.debug("system_prompt", { prompt: themeSystemPrompt() });

  const [structureResult, themeResult] = await Promise.all([
    (async () => {
      const start = Date.now();
      const json = await structureAgent.run({ prompt, brief }, provider);
      structureLog.debug("raw_response", { response: json });
      return { json, duration: Date.now() - start };
    })(),
    (async () => {
      const start = Date.now();
      const result = await themeAgent.run({ prompt, brief }, provider);
      themeLog.debug("raw_response", { response: result });
      const selection = parseThemeSelection(result);
      return { selection, duration: Date.now() - start };
    })(),
  ]);

  const structure = parseStructure(structureResult.json);
  events?.onStructure?.(structure);
  events?.onTheme?.(themeResult.selection);

  structureLog.info("complete", { duration: structureResult.duration, blockCount: structure.blocks.length });
  themeLog.info("complete", { duration: themeResult.duration, ...themeResult.selection });

  yield `[AGENT:structure:complete]${JSON.stringify({
    blockCount: structure.blocks.length,
    duration: structureResult.duration,
  })}\n`;

  yield `[AGENT:theme:complete]${JSON.stringify({
    palette: themeResult.selection.palette,
    typography: themeResult.selection.typography,
    duration: themeResult.duration,
  })}\n`;

  // emit theme marker for existing parser compatibility (uses palette as theme)
  yield `[THEME:${themeResult.selection.palette}]\n`;

  // step 3: plan and resolve images
  let images: ImageSelection[] = [];
  if (config?.mediaClient) {
    yield "[AGENT:image:start]\n";
    const imageStart = Date.now();
    const imageLog = log.child({ agent: "image" });

    const imagePlanJson = await imageAgent.run({ prompt, brief, structure }, provider);
    imageLog.debug("raw_response", { response: imagePlanJson });

    const imagePlan = parseImagePlan(imagePlanJson);
    imageLog.debug("parsed_plan", { plan: imagePlan });

    if (imagePlan.length > 0) {
      images = await config.mediaClient.executePlan(imagePlan);
      events?.onImages?.(images);
    }

    const imageDuration = Date.now() - imageStart;
    imageLog.info("complete", { duration: imageDuration, planned: imagePlan.length, resolved: images.length });

    yield `[AGENT:image:complete]${JSON.stringify({
      planned: imagePlan.length,
      resolved: images.length,
      duration: imageDuration,
    })}\n`;
  }

  // step 4: generate copy (streaming)
  yield "[AGENT:copy:start]\n";
  const copyStart = Date.now();
  const copyLog = log.child({ agent: "copy" });
  copyLog.debug("context", { brief, structure, imageCount: images.length });

  for await (const chunk of copyAgent.run(
    { prompt, messages: input.messages, brief, structure, context: { images } },
    provider,
  )) {
    yield chunk;
  }

  const copyDuration = Date.now() - copyStart;
  copyLog.info("complete", { duration: copyDuration });

  yield `[AGENT:copy:complete]${JSON.stringify({
    duration: copyDuration,
  })}\n`;
}
