import type { Block } from "@muse/core";
import type { Usage } from "@muse/ai";

export interface ProgressBlock {
  type: string
  purpose: string
}

export interface Progress {
  stage: "brief" | "structure"
  data: {
    summary?: string
    blocks?: ProgressBlock[]
  }
}

export interface ParseState {
  theme?: string
  blockCount: number
  progressCount: number
}

export interface ParseResult {
  displayText: string
  theme?: string
  newBlocks: Block[]
  usage?: Usage
  progress: Progress[]
  state: ParseState
}

const THEME_REGEX = /\[THEME:([^\]]+)\]/;
const BLOCK_REGEX = /\[BLOCK\]([\s\S]*?)\[\/BLOCK\]/g;
const USAGE_REGEX = /\[USAGE:(\{[^}]+\})\]/;
const PROGRESS_REGEX = /\[PROGRESS:(\w+)\]([\s\S]*?)\[\/PROGRESS\]/g;

export function parseStream(
  accumulated: string,
  previousState: ParseState,
): ParseResult {
  let displayText = accumulated;
  let theme = previousState.theme;
  let usage: Usage | undefined;
  const newBlocks: Block[] = [];
  const progress: Progress[] = [];

  // extract theme if not already found
  if (!theme) {
    const themeMatch = accumulated.match(THEME_REGEX);
    if (themeMatch) {
      theme = themeMatch[1];
    }
  }

  // extract all progress events
  const progressMatches = [...accumulated.matchAll(PROGRESS_REGEX)];
  for (const match of progressMatches) {
    const stage = match[1] as Progress["stage"];
    const jsonStr = match[2]?.trim();
    if (!jsonStr) continue;

    try {
      const data = JSON.parse(jsonStr) as Progress["data"];
      progress.push({ stage, data });
    }
    catch {
      console.warn("failed to parse progress:", jsonStr);
    }
  }

  // extract usage if present
  const usageMatch = accumulated.match(USAGE_REGEX);
  if (usageMatch?.[1]) {
    try {
      usage = JSON.parse(usageMatch[1]) as Usage;
    }
    catch {
      console.warn("failed to parse usage:", usageMatch[1]);
    }
  }

  // find all complete blocks
  const blockMatches = [...accumulated.matchAll(BLOCK_REGEX)];
  const newBlockCount = blockMatches.length;

  // parse only new blocks (ones we haven't seen before)
  for (let i = previousState.blockCount; i < newBlockCount; i++) {
    const match = blockMatches[i];
    if (!match) continue;

    try {
      const json = match[1]?.trim();
      if (!json) continue;
      const block = JSON.parse(json) as Partial<Block>;

      // ensure block has required fields
      if (block.type && block.id) {
        newBlocks.push(block as Block);
      }
      else if (block.type) {
        newBlocks.push({ ...block, id: crypto.randomUUID() } as Block);
      }
    }
    catch {
      console.warn("Failed to parse block JSON:", match[1]);
    }
  }

  // strip markers from display text
  displayText = displayText
    .replace(THEME_REGEX, "")
    .replace(PROGRESS_REGEX, "")
    .replace(BLOCK_REGEX, "")
    .replace(USAGE_REGEX, "")
    .replace(/\[BLOCK\][\s\S]*$/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    displayText,
    theme,
    newBlocks,
    usage,
    progress,
    state: { theme, blockCount: newBlockCount, progressCount: progress.length },
  };
}
