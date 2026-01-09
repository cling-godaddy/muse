import type { A2AEmitter } from "./emitter.js";

/**
 * Regex patterns for orchestrator markers
 */
const AGENT_START = /\[AGENT:(\w+):start\]/g;
const AGENT_COMPLETE = /\[AGENT:(\w+):complete\]([^\n]*)/g;
const THEME = /\[THEME:([^\]]+)\]/;
const SECTIONS = /\[SECTIONS:(\[[\s\S]*?\])\]/;
const IMAGES = /\[IMAGES:(\[[\s\S]*?\])\]/;
const SITEMAP = /\[SITEMAP:(.+)\](?=\n|$)/;
const PAGE = /\[PAGE:([^\]]+)\]/g;
const USAGE = /\[USAGE:([^\]]+)\]/;

type AgentName = "brief" | "structure" | "theme" | "image" | "copy" | "sitemap" | "pages";

const AGENT_DESCRIPTIONS: Record<AgentName, string> = {
  brief: "Extracting brand context",
  structure: "Planning page layout",
  theme: "Selecting color scheme",
  copy: "Generating content",
  image: "Resolving images",
  sitemap: "Planning site structure",
  pages: "Generating pages",
};

// Fields safe to spread into status metadata (avoid payload bloat)
const SAFE_AGENT_FIELDS = ["duration", "summary", "sectionCount", "pageCount", "planned", "resolved"];

interface TranslatorOptions {
  /** Called when a marker fails to parse */
  onParseError?: (marker: string, error: Error) => void
}

interface TranslatorState {
  /** Theme: first wins (set once during generation) */
  emittedTheme: boolean
  /** Track seen pages by slug to avoid duplicate status updates */
  emittedPages: Set<string>
  /** Revision counter for sections (last wins) */
  sectionsRev: number
  /** Revision counter for images (last wins) */
  imagesRev: number
  /** Revision counter for sitemap (last wins) */
  sitemapRev: number
}

/**
 * Create a marker translator that converts orchestrator output to A2A events.
 *
 * Artifact emit strategy:
 * - theme: first wins (set once during generation)
 * - sections/images/sitemap: last wins (later emissions replace earlier)
 */
export function createMarkerTranslator(emitter: A2AEmitter, options: TranslatorOptions = {}) {
  const state: TranslatorState = {
    emittedTheme: false,
    emittedPages: new Set(),
    sectionsRev: 0,
    imagesRev: 0,
    sitemapRev: 0,
  };

  function handleParseError(marker: string, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    options.onParseError?.(marker, err);
    // Emit status so clients know something went wrong
    emitter.statusUpdate("parse_error", {
      description: "Failed to parse marker",
      marker: marker.slice(0, 100), // Truncate to avoid bloat
      error: err.message,
    });
  }

  /**
   * Process a chunk of orchestrator output and emit A2A events.
   * Call this for each yielded string from the orchestrator.
   */
  function processChunk(chunk: string): void {
    // Agent start events
    for (const match of chunk.matchAll(AGENT_START)) {
      const name = match[1] as AgentName;
      const description = AGENT_DESCRIPTIONS[name] ?? `Running ${name}`;
      emitter.statusUpdate(name, { description });
    }

    // Agent complete events (update status with completion data)
    for (const match of chunk.matchAll(AGENT_COMPLETE)) {
      const name = match[1] as AgentName;
      const jsonStr = match[2];
      const metadata: Record<string, unknown> = { completed: true };

      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr) as Record<string, unknown>;
          // Only spread safe fields to avoid payload bloat
          for (const field of SAFE_AGENT_FIELDS) {
            if (field in data) {
              metadata[field] = data[field];
            }
          }
        }
        catch (err) {
          handleParseError(`[AGENT:${name}:complete]${jsonStr}`, err);
        }
      }

      emitter.statusUpdate(name, { description: `${AGENT_DESCRIPTIONS[name] ?? name} complete`, ...metadata });
    }

    // Theme artifact (first wins - theme is set once)
    if (!state.emittedTheme) {
      const themeMatch = chunk.match(THEME);
      if (themeMatch?.[1]) {
        try {
          const theme = JSON.parse(themeMatch[1]);
          emitter.artifactUpdate(
            { name: "theme", parts: [{ data: theme }] },
            { lastChunk: true },
          );
          state.emittedTheme = true;
        }
        catch (err) {
          handleParseError(themeMatch[0], err);
        }
      }
    }

    // Sitemap artifact (last wins - may be refined during generation)
    const sitemapMatch = chunk.match(SITEMAP);
    if (sitemapMatch?.[1]) {
      try {
        const sitemap = JSON.parse(sitemapMatch[1]);
        state.sitemapRev++;
        emitter.artifactUpdate(
          { name: "sitemap", parts: [{ data: sitemap }] },
          { lastChunk: true, metadata: { rev: state.sitemapRev } },
        );
      }
      catch (err) {
        handleParseError(sitemapMatch[0], err);
      }
    }

    // Page markers (multi-page) - emit as status updates with minimal metadata
    for (const match of chunk.matchAll(PAGE)) {
      const jsonStr = match[1];
      if (jsonStr) {
        try {
          const pageInfo = JSON.parse(jsonStr) as { slug?: string, title?: string };
          const pageKey = pageInfo.slug ?? jsonStr;
          if (!state.emittedPages.has(pageKey)) {
            // Keep metadata minimal: just slug and title
            emitter.statusUpdate("page", {
              description: `Generating ${pageInfo.title || pageInfo.slug || "page"}`,
              slug: pageInfo.slug,
              title: pageInfo.title,
            });
            state.emittedPages.add(pageKey);
          }
        }
        catch (err) {
          handleParseError(match[0], err);
        }
      }
    }

    // Sections artifact (last wins - may have draft then final)
    const sectionsMatch = chunk.match(SECTIONS);
    if (sectionsMatch?.[1]) {
      try {
        const sections = JSON.parse(sectionsMatch[1]);
        state.sectionsRev++;
        emitter.artifactUpdate(
          { name: "sections", parts: [{ data: sections }] },
          { lastChunk: true, metadata: { rev: state.sectionsRev } },
        );
      }
      catch (err) {
        handleParseError(sectionsMatch[0], err);
      }
    }

    // Images artifact (last wins - planned then resolved)
    const imagesMatch = chunk.match(IMAGES);
    if (imagesMatch?.[1]) {
      try {
        const images = JSON.parse(imagesMatch[1]);
        state.imagesRev++;
        emitter.artifactUpdate(
          { name: "images", parts: [{ data: images }] },
          { lastChunk: true, metadata: { rev: state.imagesRev } },
        );
      }
      catch (err) {
        handleParseError(imagesMatch[0], err);
      }
    }

    // Usage marker (typically at the end)
    const usageMatch = chunk.match(USAGE);
    if (usageMatch?.[1]) {
      try {
        const usage = JSON.parse(usageMatch[1]);
        emitter.statusUpdate("usage", { description: "Generation complete", usage });
      }
      catch (err) {
        handleParseError(usageMatch[0], err);
      }
    }
  }

  return { processChunk };
}
