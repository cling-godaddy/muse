import { groupBy } from "lodash-es";
import type { Block } from "@muse/core";
import type { Usage } from "@muse/ai";
import type { ImageSelection } from "@muse/media";

export type AgentName = "brief" | "structure" | "theme" | "image" | "copy";
export type AgentStatus = "pending" | "running" | "complete";

export interface AgentState {
  name: AgentName
  status: AgentStatus
  summary?: string
  duration?: number
  data?: {
    blockCount?: number
    blockTypes?: string[]
    palette?: string
    typography?: string
    planned?: number
    resolved?: number
  }
}

export interface ThemeSelection {
  palette: string
  typography: string
  effects?: string
}

export interface ParseState {
  theme?: ThemeSelection
  blockCount: number
  agents: Map<AgentName, AgentState>
  images: ImageSelection[]
}

export interface ParseResult {
  displayText: string
  theme?: ThemeSelection
  newBlocks: Block[]
  newImages: ImageSelection[]
  usage?: Usage
  agents: AgentState[]
  state: ParseState
}

const THEME_REGEX = /\[THEME:([^\]]+)\]/;
const BLOCK_REGEX = /\[BLOCK\]([\s\S]*?)\[\/BLOCK\]/g;
const USAGE_REGEX = /\[USAGE:(\{[^}]+\})\]/;
const IMAGES_REGEX = /\[IMAGES:(\[[\s\S]*?\])\]/;
const AGENT_START_REGEX = /\[AGENT:(\w+):start\]/g;
const AGENT_COMPLETE_REGEX = /\[AGENT:(\w+):complete\](\{[^}]*\})?/g;

export function parseStream(
  accumulated: string,
  previousState: ParseState,
): ParseResult {
  let displayText = accumulated;
  let theme = previousState.theme;
  let usage: Usage | undefined;
  const newBlocks: Block[] = [];
  const agents = new Map<AgentName, AgentState>(previousState.agents);

  // extract agent start events
  for (const match of accumulated.matchAll(AGENT_START_REGEX)) {
    const name = match[1] as AgentName;
    if (!agents.has(name)) {
      agents.set(name, { name, status: "running" });
    }
  }

  // extract agent complete events
  for (const match of accumulated.matchAll(AGENT_COMPLETE_REGEX)) {
    const name = match[1] as AgentName;
    const jsonStr = match[2];
    const agent = agents.get(name) ?? { name, status: "complete" };
    agent.status = "complete";

    if (jsonStr) {
      try {
        const data = JSON.parse(jsonStr) as {
          summary?: string
          duration?: number
          blockCount?: number
          blockTypes?: string[]
          palette?: string
          typography?: string
          planned?: number
          resolved?: number
        };
        agent.duration = data.duration;
        agent.summary = data.summary;
        if (data.blockCount !== undefined || data.palette || data.typography || data.planned !== undefined) {
          agent.data = {
            blockCount: data.blockCount,
            blockTypes: data.blockTypes,
            palette: data.palette,
            typography: data.typography,
            planned: data.planned,
            resolved: data.resolved,
          };
        }
        // extract theme selection from theme agent
        if (name === "theme" && data.palette && data.typography) {
          theme = { palette: data.palette, typography: data.typography };
        }
      }
      catch {
        console.warn("failed to parse agent data:", jsonStr);
      }
    }
    agents.set(name, agent);
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

  // extract images if present (parse once, carry forward in state)
  let images = previousState.images;
  if (images.length === 0) {
    const imagesMatch = accumulated.match(IMAGES_REGEX);
    if (imagesMatch?.[1]) {
      try {
        images = JSON.parse(imagesMatch[1]) as ImageSelection[];
      }
      catch {
        console.warn("failed to parse images:", imagesMatch[1]);
      }
    }
  }

  // group images by blockId for injection
  const imagesByBlock = groupBy(images, img => img.blockId);

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
      const blockId = block.id ?? crypto.randomUUID();

      // inject images for this block
      const blockImages = imagesByBlock[blockId];
      if (blockImages && blockImages.length > 0) {
        const imgSources = blockImages.map(s => s.image);
        if (block.type === "gallery") {
          // gallery uses images array
          block.images = imgSources;
        }
        else if (block.type === "hero") {
          // hero uses backgroundImage (ambient for overlay, subject for split)
          const img = blockImages.find(s => s.category === "ambient" || s.category === "subject");
          if (img) {
            (block as { backgroundImage?: unknown }).backgroundImage = img.image;
          }
        }
        else if (block.type === "testimonials") {
          // testimonials: assign images to quotes
          const quotes = (block as { quotes?: { image?: unknown }[] }).quotes;
          if (quotes) {
            quotes.forEach((q, idx) => {
              if (imgSources[idx]) q.image = imgSources[idx];
            });
          }
        }
        else if (block.type === "features") {
          // features-alternating: assign images to items
          const items = (block as { items?: { image?: unknown }[] }).items;
          if (items) {
            items.forEach((item, idx) => {
              if (imgSources[idx]) item.image = imgSources[idx];
            });
          }
        }
      }

      if (block.type && block.id) {
        newBlocks.push(block as Block);
      }
      else if (block.type) {
        newBlocks.push({ ...block, id: blockId } as Block);
      }
    }
    catch {
      console.warn("Failed to parse block JSON:", match[1]);
    }
  }

  // strip markers from display text
  displayText = displayText
    .replace(THEME_REGEX, "")
    .replace(AGENT_START_REGEX, "")
    .replace(AGENT_COMPLETE_REGEX, "")
    .replace(BLOCK_REGEX, "")
    .replace(USAGE_REGEX, "")
    .replace(IMAGES_REGEX, "")
    .replace(/\[BLOCK\][\s\S]*$/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // convert agents map to ordered array
  const agentOrder: AgentName[] = ["brief", "structure", "theme", "copy", "image"];
  const agentsArray = agentOrder
    .map(name => agents.get(name))
    .filter((agent): agent is AgentState => agent !== undefined);

  // detect newly arrived images (for post-block injection)
  const newImages = images.length > 0 && previousState.images.length === 0
    ? images
    : [];

  return {
    displayText,
    theme,
    newBlocks,
    newImages,
    usage,
    agents: agentsArray,
    state: { theme, blockCount: newBlockCount, agents, images },
  };
}
