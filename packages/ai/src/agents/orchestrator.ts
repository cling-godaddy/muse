import type { Message, Provider } from "../types";
import { briefAgent, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { copyAgent } from "./copy";
import type { BrandBrief, PageStructure } from "./types";

export interface OrchestratorInput {
  messages: Message[]
}

export interface OrchestratorEvents {
  onBrief?: (brief: BrandBrief) => void
  onStructure?: (structure: PageStructure) => void
}

export async function* orchestrate(
  input: OrchestratorInput,
  provider: Provider,
  events?: OrchestratorEvents,
): AsyncGenerator<string> {
  const userMessage = input.messages.find(m => m.role === "user");
  const prompt = userMessage?.content ?? "";

  // step 1: extract brief
  const briefJson = await briefAgent.run({ prompt }, provider);
  const brief = parseBrief(briefJson);
  events?.onBrief?.(brief);

  // emit brief progress
  yield `[PROGRESS:brief]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
  })}[/PROGRESS]\n`;

  // step 2: plan structure
  const structureJson = await structureAgent.run({ prompt, brief }, provider);
  const structure = parseStructure(structureJson);
  events?.onStructure?.(structure);

  // emit structure progress
  yield `[PROGRESS:structure]${JSON.stringify({
    blocks: structure.blocks.map(b => ({ type: b.type, purpose: b.purpose })),
  })}[/PROGRESS]\n`;

  // step 3: generate copy (streaming)
  for await (const chunk of copyAgent.run(
    { prompt, messages: input.messages, brief, structure },
    provider,
  )) {
    yield chunk;
  }
}
