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
  blocks: Block[]
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
const BLOCKS_REGEX = /\[BLOCKS:(\[[\s\S]*?\])\]/;
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
  let newBlocks: Block[] = [];
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

  // extract blocks (all at once now, not streaming)
  let blocks = previousState.blocks;
  if (blocks.length === 0) {
    const blocksMatch = accumulated.match(BLOCKS_REGEX);
    if (blocksMatch?.[1]) {
      try {
        const parsedBlocks = JSON.parse(blocksMatch[1]) as Block[];

        // inject images into blocks
        blocks = parsedBlocks.map((block) => {
          const blockImages = imagesByBlock[block.id];
          if (!blockImages || blockImages.length === 0) return block;

          const imgSources = blockImages.map(s => s.image);

          if (block.type === "gallery") {
            return { ...block, images: imgSources };
          }
          if (block.type === "hero") {
            const img = blockImages.find(s => s.category === "ambient" || s.category === "subject");
            if (img) {
              return { ...block, backgroundImage: img.image };
            }
          }
          if (block.type === "testimonials") {
            const testimonials = block as Block & { quotes?: Record<string, unknown>[] };
            if (testimonials.quotes) {
              return {
                ...block,
                quotes: testimonials.quotes.map((q, idx) => ({
                  ...q,
                  image: imgSources[idx] ?? q.image,
                })),
              } as unknown as Block;
            }
          }
          if (block.type === "features") {
            const features = block as Block & { items?: Record<string, unknown>[] };
            if (features.items) {
              return {
                ...block,
                items: features.items.map((item, idx) => ({
                  ...item,
                  image: imgSources[idx] ?? item.image,
                })),
              } as unknown as Block;
            }
          }

          return block;
        });

        newBlocks = blocks;
      }
      catch {
        console.warn("failed to parse blocks:", blocksMatch[1]?.slice(0, 200));
      }
    }
  }

  // strip markers from display text
  displayText = displayText
    .replace(THEME_REGEX, "")
    .replace(AGENT_START_REGEX, "")
    .replace(AGENT_COMPLETE_REGEX, "")
    .replace(BLOCKS_REGEX, "")
    .replace(USAGE_REGEX, "")
    .replace(IMAGES_REGEX, "")
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
    state: { theme, blocks, agents, images },
  };
}
