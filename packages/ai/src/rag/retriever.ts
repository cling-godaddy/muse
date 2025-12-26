import { embed } from "./embeddings";
import { search, getEntry, getConfig } from "./store";
import type { KBEntry, RetrievedExample, RetrieveOptions, StructureKBEntry } from "./types";

function getEmbedText(entry: KBEntry, fields: string[]): string {
  const parts: string[] = [];

  for (const field of fields) {
    const value = entry[field];
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      parts.push(value.join(" "));
    }
    else if (typeof value === "string") {
      parts.push(value);
    }
  }

  return parts.join(" ");
}

export async function retrieve<T extends KBEntry = KBEntry>(
  kbName: string,
  query: string,
  options: RetrieveOptions = {},
): Promise<RetrievedExample<T>[]> {
  const { topK = 3, minScore = 0.5 } = options;

  const vec = await embed(query);
  const results = search(kbName, vec, topK);

  const examples: RetrievedExample<T>[] = [];

  for (const r of results) {
    if (r.score < minScore) continue;
    const entry = getEntry<T>(kbName, r.id);
    if (entry) {
      examples.push({ entry, score: r.score });
    }
  }

  return examples;
}

const TEMPLATE_THRESHOLD = 0.8;

export function formatStructureContext(
  examples: RetrievedExample<StructureKBEntry>[],
): { text: string, isTemplate: boolean } {
  if (examples.length === 0) return { text: "", isTemplate: false };

  const top = examples[0];
  if (!top) return { text: "", isTemplate: false };

  // High confidence match - present as template to follow
  if (top.score >= TEMPLATE_THRESHOLD) {
    const blocks = top.entry.structure.blocks.map((block, i) => ({
      id: `block-${i + 1}`,
      type: block.type,
      preset: block.preset,
    }));

    const lines = [
      "TEMPLATE - Copy this EXACT structure:",
      "",
      `Match: "${top.entry.request}" (${(top.score * 100).toFixed(0)}% match)`,
      "",
      "```json",
      JSON.stringify({ blocks }, null, 2),
      "```",
    ];

    return { text: lines.join("\n"), isTemplate: true };
  }

  // Lower confidence - present as examples for guidance
  const lines = ["SIMILAR EXAMPLES (use as guidance):", ""];

  for (const { entry } of examples) {
    lines.push(`Request: "${entry.request}"`);
    lines.push("Structure:");
    for (const block of entry.structure.blocks) {
      lines.push(`  - ${block.type}/${block.preset}: ${block.rationale}`);
    }
    lines.push("");
  }

  return { text: lines.join("\n"), isTemplate: false };
}

// Keep old function for backwards compat
export function formatStructureExamples(
  examples: RetrievedExample<StructureKBEntry>[],
): string {
  return formatStructureContext(examples).text;
}

export { getEmbedText, getConfig };
