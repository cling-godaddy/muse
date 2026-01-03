import { groupBy } from "lodash-es";
import type { Section, SectionType, NavbarConfig } from "@muse/core";
import { getPresetImageInjection, getImageInjection, applyImageInjection } from "@muse/core";
import type { Usage, SitemapPlan } from "@muse/ai";
import type { ImageSelection } from "@muse/media";

export type AgentName = "brief" | "structure" | "theme" | "image" | "copy" | "sitemap" | "pages";
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

export interface PageInfo {
  slug: string
  title: string
  sections: Section[]
}

export interface ParseState {
  theme?: ThemeSelection
  sitemap?: SitemapPlan
  navbar?: NavbarConfig
  sections: Section[]
  pages: PageInfo[]
  agents: Map<AgentName, AgentState>
  images: ImageSelection[]
}

export interface ParseResult {
  displayText: string
  theme?: ThemeSelection
  sitemap?: SitemapPlan
  navbar?: NavbarConfig
  newSections: Section[]
  newPages: PageInfo[]
  newImages: ImageSelection[]
  usage?: Usage
  agents: AgentState[]
  state: ParseState
}

const THEME_REGEX = /\[THEME:([^\]]+)\]/;
const SECTIONS_REGEX = /\[SECTIONS:(\[[\s\S]*?\])\]/g;
const USAGE_REGEX = /\[USAGE:([^\]]+)\]/;
const IMAGES_REGEX = /\[IMAGES:(\[[\s\S]*?\])\]/;
const SITEMAP_REGEX = /\[SITEMAP:(.+)\](?=\n)/;
const NAVBAR_REGEX = /\[NAVBAR:(.+)\](?=\n)/;
const PAGE_REGEX = /\[PAGE:([^\]]+)\]/g;
const AGENT_START_REGEX = /\[AGENT:(\w+):start\]/g;
const AGENT_COMPLETE_REGEX = /\[AGENT:(\w+):complete\]([^\n]*)/g;

export function parseStream(
  accumulated: string,
  previousState: ParseState,
): ParseResult {
  let displayText = accumulated;
  let theme = previousState.theme;
  let sitemap = previousState.sitemap;
  let usage: Usage | undefined;
  let newSections: Section[] = [];
  let newPages: PageInfo[] = [];
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
          pageCount?: number
        };
        agent.duration = data.duration;
        agent.summary = data.summary;
        if (data.sectionCount !== undefined || data.palette || data.typography || data.planned !== undefined || data.pageCount !== undefined) {
          agent.data = {
            sectionCount: data.sectionCount ?? data.pageCount,
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

  // extract sitemap if present
  if (!sitemap) {
    const sitemapMatch = accumulated.match(SITEMAP_REGEX);
    if (sitemapMatch?.[1]) {
      try {
        sitemap = JSON.parse(sitemapMatch[1]) as SitemapPlan;
      }
      catch {
        console.warn("failed to parse sitemap:", sitemapMatch[1]?.slice(0, 200));
      }
    }
  }

  // extract navbar if present
  let navbar = previousState.navbar;
  if (!navbar) {
    const navbarMatch = accumulated.match(NAVBAR_REGEX);
    if (navbarMatch?.[1]) {
      try {
        navbar = JSON.parse(navbarMatch[1]) as NavbarConfig;
      }
      catch {
        console.warn("failed to parse navbar:", navbarMatch[1]?.slice(0, 200));
      }
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

  // Helper to inject images into sections
  const injectImages = (sections: Section[]): Section[] => {
    return sections.map((section): Section => {
      const sectionImages = imagesBySection[section.id];
      if (!sectionImages || sectionImages.length === 0) return section;

      const imgSources = sectionImages.map(s => s.image);
      const injection = section.preset
        ? getPresetImageInjection(section.preset)
        : getImageInjection(section.type as SectionType);

      if (injection) {
        const updates = applyImageInjection(section, imgSources, injection);
        return { ...section, ...updates } as Section;
      }

      return section;
    });
  };

  // extract pages with their sections (multi-page format)
  let pages = previousState.pages;
  let sections = previousState.sections;

  if (pages.length === 0) {
    // Try to parse PAGE markers followed by SECTIONS
    const pageMatches = [...accumulated.matchAll(PAGE_REGEX)];
    const sectionsMatches = [...accumulated.matchAll(SECTIONS_REGEX)];

    if (pageMatches.length > 0 && sectionsMatches.length >= pageMatches.length) {
      // Multi-page format
      pages = pageMatches.map((pageMatch, idx) => {
        try {
          const pageJson = pageMatch[1];
          if (!pageJson) return { slug: "/", title: "Home", sections: [] };
          const pageInfo = JSON.parse(pageJson) as { slug: string, title: string, sectionCount: number };
          const sectionsJson = sectionsMatches[idx]?.[1];
          let pageSections: Section[] = [];
          if (sectionsJson) {
            pageSections = injectImages(JSON.parse(sectionsJson) as Section[]);
          }
          return {
            slug: pageInfo.slug,
            title: pageInfo.title,
            sections: pageSections,
          };
        }
        catch {
          return { slug: "/", title: "Home", sections: [] };
        }
      });
      newPages = pages;
      // Also set sections to first page for backward compatibility
      if (pages.length > 0 && pages[0]) {
        sections = pages[0].sections;
        newSections = sections;
      }
    }
    else if (sectionsMatches.length > 0 && pageMatches.length === 0) {
      // Single-page format (backward compatibility)
      const sectionsJson = sectionsMatches[0]?.[1];
      if (sectionsJson) {
        try {
          sections = injectImages(JSON.parse(sectionsJson) as Section[]);
          newSections = sections;
          // Create a default page
          pages = [{ slug: "/", title: "Home", sections }];
          newPages = pages;
        }
        catch {
          console.warn("failed to parse sections:", sectionsJson?.slice(0, 200));
        }
      }
    }
  }

  // strip markers from display text
  displayText = displayText
    .replace(THEME_REGEX, "")
    .replace(SITEMAP_REGEX, "")
    .replace(NAVBAR_REGEX, "")
    .replace(PAGE_REGEX, "")
    .replace(AGENT_START_REGEX, "")
    .replace(AGENT_COMPLETE_REGEX, "")
    .replace(SECTIONS_REGEX, "")
    .replace(USAGE_REGEX, "")
    .replace(IMAGES_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // convert agents map to ordered array
  const agentOrder: AgentName[] = ["brief", "sitemap", "theme", "pages", "copy", "image"];
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
    sitemap,
    navbar,
    newSections,
    newPages,
    newImages,
    usage,
    agents: agentsArray,
    state: { theme, sitemap, navbar, sections, pages, agents, images },
  };
}
