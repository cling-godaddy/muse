import type { Message, Provider } from "../types";
import { briefAgent, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { themeAgent, parseThemeSelection, type ThemeSelection } from "./theme";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure } from "./types";

export interface OrchestratorInput {
  messages: Message[]
}

export interface OrchestratorEvents {
  onBrief?: (brief: BrandBrief) => void
  onStructure?: (structure: PageStructure) => void
  onTheme?: (theme: ThemeSelection) => void
}

export async function* orchestrate(
  input: OrchestratorInput,
  provider: Provider,
  events?: OrchestratorEvents,
): AsyncGenerator<string> {
  const userMessage = input.messages.find(m => m.role === "user");
  const prompt = userMessage?.content ?? "";

  // step 1: extract brief
  yield "[AGENT:brief:start]\n";
  const briefStart = Date.now();
  const briefJson = await briefAgent.run({ prompt }, provider);
  const brief = parseBrief(briefJson);
  events?.onBrief?.(brief);
  yield `[AGENT:brief:complete]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
    duration: Date.now() - briefStart,
  })}\n`;

  // step 2: plan structure + select theme (parallel)
  yield "[AGENT:structure:start]\n";
  yield "[AGENT:theme:start]\n";

  const [structureResult, themeResult] = await Promise.all([
    (async () => {
      const start = Date.now();
      const json = await structureAgent.run({ prompt, brief }, provider);
      return { json, duration: Date.now() - start };
    })(),
    (async () => {
      const start = Date.now();
      const result = await themeAgent.run({ prompt, brief }, provider);
      const selection = parseThemeSelection(result);
      return { selection, duration: Date.now() - start };
    })(),
  ]);

  const structure = parseStructure(structureResult.json);
  events?.onStructure?.(structure);
  events?.onTheme?.(themeResult.selection);

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

  // step 3: generate copy (streaming)
  yield "[AGENT:copy:start]\n";
  const copyStart = Date.now();

  for await (const chunk of copyAgent.run(
    { prompt, messages: input.messages, brief, structure },
    provider,
  )) {
    yield chunk;
  }

  yield `[AGENT:copy:complete]${JSON.stringify({
    duration: Date.now() - copyStart,
  })}\n`;
}
