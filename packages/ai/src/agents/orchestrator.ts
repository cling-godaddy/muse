import type { MediaClient, ImageSelection } from "@muse/media";
import { createLogger, type Logger } from "@muse/logger";
import { getMinimumImages, getImageRequirements, allPresets, type Section, type Page, createPage, type ThemeBackground } from "@muse/core";
import { resolveTheme } from "@muse/themes";
import type { Message, Provider } from "../types";
import { runWithRetry } from "../retry";
import { calculateCost } from "../pricing";
import { briefAgent, briefSystemPrompt, parseBrief } from "./brief";
import { structureAgent, parseStructure } from "./structure";
import { themeAgent, themeSystemPrompt, parseThemeSelection, type ThemeSelection } from "./theme";
import { imageAgent, parseImagePlan } from "./image";
import { copyAgent } from "./copy";
import { sitemapAgent, parseSitemap } from "./sitemap";
import type { BrandBrief, PageStructure, CopySectionContent, SitemapPlan } from "./types";

interface UsageAccumulator {
  input: number
  output: number
}

// Simple JSON parser for schema-validated responses
function parseJson<T>(json: string): T {
  return JSON.parse(json);
}

// Replace AI-generated section IDs with proper UUIDs, returning a mapping for image plan remapping
function assignSectionIds(sections: Section[]): { sections: Section[], idMap: Map<string, string> } {
  const idMap = new Map<string, string>();
  const newSections = sections.map((section) => {
    const newId = crypto.randomUUID();
    if (section.id) idMap.set(section.id, newId);
    return { ...section, id: newId };
  });
  return { sections: newSections, idMap };
}

// Resolve section backgrounds from preset semantic keys to hex values
function resolveSectionBackgrounds(sections: Section[], theme: ThemeSelection): Section[] {
  const resolved = resolveTheme({ palette: theme.palette, typography: theme.typography });
  const bgMap: Record<ThemeBackground, string> = {
    background: resolved.colors.background,
    backgroundAlt: resolved.colors.backgroundAlt,
  };

  return sections.map((section) => {
    if (section.backgroundColor) return section; // Already has explicit color
    if (!section.preset) return section;

    const preset = allPresets[section.preset];
    if (!preset?.defaultBackground) return section;

    return { ...section, backgroundColor: bgMap[preset.defaultBackground] };
  });
}

// Extract copy section summaries for image agent context
function extractCopySectionSummaries(sections: Section[]): CopySectionContent[] {
  return sections.map(section => ({
    id: section.id,
    headline: (section as { headline?: string }).headline,
    subheadline: (section as { subheadline?: string }).subheadline,
    itemTitles: (section as { items?: { title?: string }[] }).items
      ?.map(i => i.title)
      .filter((t): t is string => !!t),
  }));
}

export interface SiteContext {
  name?: string
  description?: string
  location?: string
}

export interface OrchestratorInput {
  messages: Message[]
  siteContext?: SiteContext
}

export interface OrchestratorConfig {
  mediaClient?: MediaClient
  logger?: Logger
}

export interface OrchestratorEvents {
  onBrief?: (brief: BrandBrief) => void
  onStructure?: (structure: PageStructure) => void
  onTheme?: (theme: ThemeSelection) => void
  onSections?: (sections: Section[]) => void
  onImages?: (images: ImageSelection[]) => void
}

function buildAugmentedPrompt(userPrompt: string, siteContext?: SiteContext): string {
  if (!siteContext) return userPrompt;

  const parts: string[] = [];
  if (siteContext.name) parts.push(`Business: ${siteContext.name}`);
  if (siteContext.description) parts.push(`Description: ${siteContext.description}`);
  if (siteContext.location) parts.push(`Location: ${siteContext.location}`);

  if (parts.length === 0) return userPrompt;
  return `${parts.join("\n")}\n\nUser request: ${userPrompt}`;
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
  const rawPrompt = userMessage?.content ?? "";
  const prompt = buildAugmentedPrompt(rawPrompt, input.siteContext);

  // Track total usage across all agents
  const totalUsage: UsageAccumulator = { input: 0, output: 0 };
  const addUsage = (usage?: { input: number, output: number }) => {
    if (usage) {
      totalUsage.input += usage.input;
      totalUsage.output += usage.output;
    }
  };

  // step 1: extract brief
  yield "[AGENT:brief:start]\n";
  const briefStart = Date.now();
  const briefLog = log.child({ agent: "brief" });
  briefLog.debug("system_prompt", { prompt: briefSystemPrompt });
  briefLog.debug("user_input", { prompt });

  const briefResult = await runWithRetry(briefAgent, { prompt }, provider, parseJson<BrandBrief>);
  const brief = briefResult.data ?? parseBrief(briefResult.raw);
  addUsage(briefResult.usage);
  briefLog.debug("raw_response", { response: briefResult.raw, attempts: briefResult.attempts });

  events?.onBrief?.(brief);
  const briefDuration = Date.now() - briefStart;
  briefLog.info("complete", { duration: briefDuration, brief, retried: briefResult.attempts > 1 });
  yield `[AGENT:brief:complete]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
    duration: briefDuration,
  })}\n`;

  // step 2: plan structure + select theme (parallel)
  yield "[AGENT:structure:start]\n";
  yield "[AGENT:theme:start]\n";

  const structureLog = log.child({ agent: "structure" });
  const themeLog = log.child({ agent: "theme" });

  structureLog.debug("starting", { prompt });
  themeLog.debug("system_prompt", { prompt: themeSystemPrompt() });

  const [structureResult, themeResult] = await Promise.all([
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(structureAgent, { prompt, brief }, provider, parseJson<PageStructure>);
      const structure = result.data ?? parseStructure(result.raw);
      structureLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { structure, duration: Date.now() - start, retried: result.attempts > 1, usage: result.usage };
    })(),
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(themeAgent, { prompt, brief }, provider, parseJson<ThemeSelection>);
      const selection = result.data ?? parseThemeSelection(result.raw);
      themeLog.debug("raw_response", { response: result.raw, attempts: result.attempts });
      return { selection, duration: Date.now() - start, retried: result.attempts > 1, usage: result.usage };
    })(),
  ]);

  const structure = structureResult.structure;
  addUsage(structureResult.usage);
  addUsage(themeResult.usage);
  events?.onStructure?.(structure);
  events?.onTheme?.(themeResult.selection);

  structureLog.info("complete", { duration: structureResult.duration, sectionCount: structure.sections.length });
  themeLog.info("complete", { duration: themeResult.duration, ...themeResult.selection });

  yield `[AGENT:structure:complete]${JSON.stringify({
    sectionCount: structure.sections.length,
    sectionTypes: structure.sections.map(s => s.type),
    duration: structureResult.duration,
  })}\n`;

  yield `[AGENT:theme:complete]${JSON.stringify({
    palette: themeResult.selection.palette,
    typography: themeResult.selection.typography,
    duration: themeResult.duration,
  })}\n`;

  // emit theme marker for existing parser compatibility
  yield `[THEME:${themeResult.selection.palette}]\n`;

  // step 3: generate copy (non-streaming, structured output)
  yield "[AGENT:copy:start]\n";
  const copyStart = Date.now();
  const copyLog = log.child({ agent: "copy" });
  copyLog.debug("context", { brief, structure });

  const copyResult = await copyAgent.run(
    { prompt, messages: input.messages, brief, structure },
    provider,
  );
  addUsage(copyResult.usage);

  const copyDuration = Date.now() - copyStart;
  copyLog.info("complete", { duration: copyDuration });

  // Parse copy result as { sections: Section[] }
  let sections: Section[] = [];
  let sectionIdMap = new Map<string, string>();
  try {
    const parsed = JSON.parse(copyResult.content) as { sections: Section[] };
    copyLog.debug("copy_output_ids", { ids: parsed.sections?.map(s => s.id) ?? [] });

    const result = assignSectionIds(parsed.sections ?? []);
    sections = resolveSectionBackgrounds(result.sections, themeResult.selection);
    sectionIdMap = result.idMap;

    copyLog.debug("id_mapping", {
      structureIds: structure.sections.map(s => s.id),
      copyIds: parsed.sections?.map(s => s.id) ?? [],
      mapping: Object.fromEntries(result.idMap),
    });
  }
  catch (err) {
    copyLog.warn("parse_failed", { error: String(err), input: copyResult.content.slice(0, 200) });
  }

  events?.onSections?.(sections);

  yield `[AGENT:copy:complete]${JSON.stringify({
    sectionCount: sections.length,
    duration: copyDuration,
  })}\n`;

  // Emit all sections at once
  yield `[SECTIONS:${JSON.stringify(sections)}]\n`;

  // Extract summaries for image agent
  const copySections = extractCopySectionSummaries(sections);

  // step 4: plan and resolve images (using copy context)
  let images: ImageSelection[] = [];
  if (config?.mediaClient) {
    yield "[AGENT:image:start]\n";
    const imageStart = Date.now();
    const imageLog = log.child({ agent: "image" });

    // Replace structure IDs with actual section UUIDs using idMap
    const structureWithUUIDs: PageStructure = {
      sections: structure.sections.map(structSection => ({
        ...structSection,
        id: sectionIdMap.get(structSection.id) ?? structSection.id,
      })),
    };

    const imageResult = await imageAgent.run({ prompt, brief, structure: structureWithUUIDs, copySections }, provider);
    addUsage(imageResult.usage);
    imageLog.debug("raw_response", { response: imageResult.content });

    // Identify sections that need mixed orientations for masonry-style layouts
    const mixedOrientationSections = new Set(
      structureWithUUIDs.sections
        .filter(s => s.preset && getImageRequirements(s.preset)?.orientation === "mixed")
        .map(s => s.id),
    );

    const imagePlan = parseImagePlan(imageResult.content, mixedOrientationSections);
    imageLog.debug("parsed_plan", { plan: imagePlan, mixedSections: Array.from(mixedOrientationSections) });
    imageLog.debug("image_plan_blockIds", { blockIds: imagePlan.map(p => p.blockId) });

    if (imagePlan.length > 0) {
      // No remapping needed - image plan already has UUID blockIds
      const remappedPlan = imagePlan;

      // Compute minimum image counts per gallery section (using UUID IDs)
      const minPerSection: Record<string, number> = {};
      for (const section of structureWithUUIDs.sections) {
        if (section.type === "gallery" && section.preset) {
          minPerSection[section.id] = getMinimumImages(section.preset);
        }
      }

      images = await config.mediaClient.executePlan(remappedPlan, { minPerSection });
      events?.onImages?.(images);
    }

    const imageDuration = Date.now() - imageStart;
    imageLog.info("complete", { duration: imageDuration, planned: imagePlan.length, resolved: images.length });

    yield `[AGENT:image:complete]${JSON.stringify({
      planned: imagePlan.length,
      resolved: images.length,
      duration: imageDuration,
    })}\n`;

    // emit images for client-side injection into sections
    if (images.length > 0) {
      yield `[IMAGES:${JSON.stringify(images)}]\n`;
    }
  }

  // Emit total usage for cost tracking
  const model = provider.name === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
  yield `[USAGE:${JSON.stringify({
    input: totalUsage.input,
    output: totalUsage.output,
    cost: calculateCost(model, totalUsage.input, totalUsage.output),
    model,
    action: "generate_site",
    timestamp: new Date().toISOString(),
  })}]\n`;
}

// ============================================
// Multi-page site orchestration
// ============================================

export interface SiteOrchestratorEvents extends OrchestratorEvents {
  onSitemap?: (sitemap: SitemapPlan) => void
  onPage?: (page: Page, index: number) => void
}

export interface GeneratedPage {
  page: Page
  structure: PageStructure
  idMap: Map<string, string>
}

export interface SiteResult {
  pages: GeneratedPage[]
  theme: ThemeSelection
  brief: BrandBrief
  sitemap: SitemapPlan
}

export async function* orchestrateSite(
  input: OrchestratorInput,
  provider: Provider,
  options?: {
    config?: OrchestratorConfig
    events?: SiteOrchestratorEvents
  },
): AsyncGenerator<string> {
  const { config, events } = options ?? {};
  const log = config?.logger ?? createLogger();
  const userMessage = input.messages.find(m => m.role === "user");
  const rawPrompt = userMessage?.content ?? "";
  const prompt = buildAugmentedPrompt(rawPrompt, input.siteContext);

  const totalUsage: UsageAccumulator = { input: 0, output: 0 };
  const addUsage = (usage?: { input: number, output: number }) => {
    if (usage) {
      totalUsage.input += usage.input;
      totalUsage.output += usage.output;
    }
  };

  // Step 1: Extract brief
  yield "[AGENT:brief:start]\n";
  const briefStart = Date.now();
  const briefLog = log.child({ agent: "brief" });

  const briefResult = await runWithRetry(briefAgent, { prompt }, provider, parseJson<BrandBrief>);
  const brief = briefResult.data ?? parseBrief(briefResult.raw);
  addUsage(briefResult.usage);

  events?.onBrief?.(brief);
  const briefDuration = Date.now() - briefStart;
  briefLog.info("complete", { duration: briefDuration });
  yield `[AGENT:brief:complete]${JSON.stringify({
    summary: `${brief.targetAudience}, ${brief.brandVoice.join(", ")} tone`,
    duration: briefDuration,
  })}\n`;

  // Step 2: Plan sitemap + select theme (parallel)
  yield "[AGENT:sitemap:start]\n";
  yield "[AGENT:theme:start]\n";

  const sitemapLog = log.child({ agent: "sitemap" });
  const themeLog = log.child({ agent: "theme" });

  const [sitemapResult, themeResult] = await Promise.all([
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(sitemapAgent, { prompt, brief }, provider, parseJson<SitemapPlan>);
      const sitemap = result.data ?? parseSitemap(result.raw);
      sitemapLog.debug("raw_response", { response: result.raw });
      return { sitemap, duration: Date.now() - start, usage: result.usage };
    })(),
    (async () => {
      const start = Date.now();
      const result = await runWithRetry(themeAgent, { prompt, brief }, provider, parseJson<ThemeSelection>);
      const selection = result.data ?? parseThemeSelection(result.raw);
      themeLog.debug("raw_response", { response: result.raw });
      return { selection, duration: Date.now() - start, usage: result.usage };
    })(),
  ]);

  const sitemap = sitemapResult.sitemap;
  const theme = themeResult.selection;
  addUsage(sitemapResult.usage);
  addUsage(themeResult.usage);

  events?.onSitemap?.(sitemap);
  events?.onTheme?.(theme);

  sitemapLog.info("complete", { duration: sitemapResult.duration, pageCount: sitemap.pages.length });
  themeLog.info("complete", { duration: themeResult.duration, ...theme });

  yield `[AGENT:sitemap:complete]${JSON.stringify({
    pageCount: sitemap.pages.length,
    pages: sitemap.pages.map(p => p.slug),
    duration: sitemapResult.duration,
  })}\n`;

  yield `[AGENT:theme:complete]${JSON.stringify({
    palette: theme.palette,
    typography: theme.typography,
    duration: themeResult.duration,
  })}\n`;

  yield `[THEME:${theme.palette}]\n`;
  yield `[SITEMAP:${JSON.stringify(sitemap)}]\n`;

  // Step 3: Generate pages in parallel (structure + copy for each)
  const generatedPages: GeneratedPage[] = [];

  yield "[AGENT:pages:start]\n";
  const pagesStart = Date.now();

  const pageResults = await Promise.all(
    sitemap.pages.map(async (pagePlan, index) => {
      const pageLog = log.child({ agent: `page:${pagePlan.slug}` });

      // Structure for this page
      const structureResult = await runWithRetry(
        structureAgent,
        {
          prompt: pagePlan.purpose,
          brief,
          context: {
            pageSlug: pagePlan.slug,
            pageTitle: pagePlan.title,
            pagePurpose: pagePlan.purpose,
            pagePriority: pagePlan.priority,
            suggestedSections: pagePlan.suggestedSections,
          },
        },
        provider,
        parseJson<PageStructure>,
      );
      const structure = structureResult.data ?? parseStructure(structureResult.raw);

      // Copy for this page
      const copyResult = await copyAgent.run(
        { prompt: pagePlan.purpose, messages: input.messages, brief, structure },
        provider,
      );

      let sections: Section[] = [];
      let idMap = new Map<string, string>();
      try {
        const parsed = JSON.parse(copyResult.content) as { sections: Section[] };
        pageLog.debug("copy_output_ids", { page: pagePlan.slug, ids: parsed.sections?.map(s => s.id) ?? [] });

        const result = assignSectionIds(parsed.sections ?? []);
        sections = resolveSectionBackgrounds(result.sections, theme);
        idMap = result.idMap;

        pageLog.debug("id_mapping", {
          page: pagePlan.slug,
          structureIds: structure.sections.map(s => s.id),
          copyIds: parsed.sections?.map(s => s.id) ?? [],
          mapping: Object.fromEntries(result.idMap),
        });
      }
      catch (err) {
        pageLog.warn("copy_parse_failed", { error: String(err) });
      }

      const page = createPage(
        pagePlan.slug === "/" ? "/" : pagePlan.slug.replace(/^\//, ""),
        { title: pagePlan.title },
        sections,
      );

      return {
        page,
        structure,
        idMap,
        usage: {
          input: (structureResult.usage?.input ?? 0) + (copyResult.usage?.input ?? 0),
          output: (structureResult.usage?.output ?? 0) + (copyResult.usage?.output ?? 0),
        },
        index,
      };
    }),
  );

  // Process results and emit events
  for (const result of pageResults) {
    generatedPages.push({ page: result.page, structure: result.structure, idMap: result.idMap });
    addUsage(result.usage);
    events?.onPage?.(result.page, result.index);
    events?.onSections?.(result.page.sections);
  }

  const pagesDuration = Date.now() - pagesStart;
  log.info("pages_complete", { duration: pagesDuration, count: generatedPages.length });

  yield `[AGENT:pages:complete]${JSON.stringify({
    pageCount: generatedPages.length,
    duration: pagesDuration,
  })}\n`;

  // Emit all pages
  for (const { page } of generatedPages) {
    yield `[PAGE:${JSON.stringify({ slug: page.slug, title: page.meta.title, sectionCount: page.sections.length })}]\n`;
    yield `[SECTIONS:${JSON.stringify(page.sections)}]\n`;
  }

  // Step 4: Image planning (batched across all pages)
  if (config?.mediaClient) {
    yield "[AGENT:image:start]\n";
    const imageStart = Date.now();
    const imageLog = log.child({ agent: "image" });

    // Combine all sections for image planning
    // Use UUID IDs from actual sections to avoid collisions across pages
    // (multiple pages have section-1, section-2, etc. - using UUIDs makes them unique)
    const allSections = generatedPages.flatMap(gp => gp.page.sections);
    const allStructures = generatedPages.flatMap(gp =>
      gp.structure.sections.map(structSection => ({
        ...structSection,
        id: gp.idMap.get(structSection.id) ?? structSection.id,
      })),
    );
    const copySections = extractCopySectionSummaries(allSections);

    const combinedStructure: PageStructure = { sections: allStructures };

    const imageResult = await imageAgent.run(
      { prompt, brief, structure: combinedStructure, copySections },
      provider,
    );
    addUsage(imageResult.usage);

    const mixedOrientationSections = new Set(
      allStructures
        .filter(s => s.preset && getImageRequirements(s.preset)?.orientation === "mixed")
        .map(s => s.id),
    );

    const imagePlan = parseImagePlan(imageResult.content, mixedOrientationSections);
    imageLog.debug("image_plan_blockIds", { blockIds: imagePlan.map(p => p.blockId) });

    let images: ImageSelection[] = [];
    if (imagePlan.length > 0) {
      // No remapping needed - image plan already has UUID blockIds

      // Compute minimum image counts per gallery section
      const minPerSection: Record<string, number> = {};
      for (const section of allStructures) {
        if (section.type === "gallery" && section.preset) {
          minPerSection[section.id] = getMinimumImages(section.preset);
        }
      }

      images = await config.mediaClient.executePlan(imagePlan, { minPerSection });
      events?.onImages?.(images);
    }

    const imageDuration = Date.now() - imageStart;
    imageLog.info("complete", { duration: imageDuration, planned: imagePlan.length, resolved: images.length });

    yield `[AGENT:image:complete]${JSON.stringify({
      planned: imagePlan.length,
      resolved: images.length,
      duration: imageDuration,
    })}\n`;

    if (images.length > 0) {
      yield `[IMAGES:${JSON.stringify(images)}]\n`;
    }
  }

  // Emit total usage
  const model = provider.name === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
  yield `[USAGE:${JSON.stringify({
    input: totalUsage.input,
    output: totalUsage.output,
    cost: calculateCost(model, totalUsage.input, totalUsage.output),
    model,
  })}]\n`;
}
