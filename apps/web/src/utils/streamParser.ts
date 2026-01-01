import { groupBy } from "lodash-es";
import type { Section } from "@muse/core";
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
    sectionCount?: number
    sectionTypes?: string[]
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
  sections: Section[]
  agents: Map<AgentName, AgentState>
  images: ImageSelection[]
}

export interface ParseResult {
  displayText: string
  theme?: ThemeSelection
  newSections: Section[]
  newImages: ImageSelection[]
  usage?: Usage
  agents: AgentState[]
  state: ParseState
}

const THEME_REGEX = /\[THEME:([^\]]+)\]/;
const SECTIONS_REGEX = /\[SECTIONS:(\[[\s\S]*?\])\]/;
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
  let newSections: Section[] = [];
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
          sectionCount?: number
          sectionTypes?: string[]
          palette?: string
          typography?: string
          planned?: number
          resolved?: number
        };
        agent.duration = data.duration;
        agent.summary = data.summary;
        if (data.sectionCount !== undefined || data.palette || data.typography || data.planned !== undefined) {
          agent.data = {
            sectionCount: data.sectionCount,
            sectionTypes: data.sectionTypes,
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

  // group images by sectionId for injection
  const imagesBySection = groupBy(images, img => img.blockId);

  // extract sections (all at once now, not streaming)
  let sections = previousState.sections;
  if (sections.length === 0) {
    const sectionsMatch = accumulated.match(SECTIONS_REGEX);
    if (sectionsMatch?.[1]) {
      try {
        const parsedSections = JSON.parse(sectionsMatch[1]) as Section[];

        // inject images into sections
        sections = parsedSections.map((section) => {
          const sectionImages = imagesBySection[section.id];
          if (!sectionImages || sectionImages.length === 0) return section;

          const imgSources = sectionImages.map(s => s.image);

          if (section.type === "gallery") {
            return { ...section, images: imgSources };
          }
          if (section.type === "hero") {
            const img = sectionImages.find(s => s.category === "ambient" || s.category === "subject");
            if (img) {
              return { ...section, backgroundImage: img.image };
            }
          }
          if (section.type === "testimonials") {
            const testimonials = section as Section & { quotes?: Record<string, unknown>[] };
            if (testimonials.quotes) {
              return {
                ...section,
                quotes: testimonials.quotes.map((q, idx) => ({
                  ...q,
                  image: imgSources[idx] ?? q.image,
                })),
              } as unknown as Section;
            }
          }
          if (section.type === "features") {
            const features = section as Section & { items?: Record<string, unknown>[] };
            if (features.items) {
              return {
                ...section,
                items: features.items.map((item, idx) => ({
                  ...item,
                  image: imgSources[idx] ?? item.image,
                })),
              } as unknown as Section;
            }
          }

          return section;
        });

        newSections = sections;
      }
      catch {
        console.warn("failed to parse sections:", sectionsMatch[1]?.slice(0, 200));
      }
    }
  }

  // strip markers from display text
  displayText = displayText
    .replace(THEME_REGEX, "")
    .replace(AGENT_START_REGEX, "")
    .replace(AGENT_COMPLETE_REGEX, "")
    .replace(SECTIONS_REGEX, "")
    .replace(USAGE_REGEX, "")
    .replace(IMAGES_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // convert agents map to ordered array
  const agentOrder: AgentName[] = ["brief", "structure", "theme", "copy", "image"];
  const agentsArray = agentOrder
    .map(name => agents.get(name))
    .filter((agent): agent is AgentState => agent !== undefined);

  // detect newly arrived images (for post-section injection)
  const newImages = images.length > 0 && previousState.images.length === 0
    ? images
    : [];

  return {
    displayText,
    theme,
    newSections,
    newImages,
    usage,
    agents: agentsArray,
    state: { theme, sections, agents, images },
  };
}
