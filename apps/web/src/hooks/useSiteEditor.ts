import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useAuth } from "@clerk/clerk-react";
import { groupBy } from "lodash-es";
import type { Section, SectionType } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection, createSite } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import type { Usage } from "@muse/ai";
import { useSiteStore } from "../stores/siteStore";
import { useSite, useSaveSite } from "../queries/siteQueries";
import type { ThemeSelection, PageInfo } from "../utils/streamParser";
import type { RefineUpdate, MoveUpdate, Message } from "./useChat";

interface ThemeState {
  palette: string
  typography: string
  effects: string
}

export function useSiteEditor(siteId: string | undefined) {
  const { getToken } = useAuth();

  // Server state
  const { data: serverSite, isLoading } = useSite(siteId);
  const { mutate: saveSite, isPending: isSaving } = useSaveSite();

  // Client state from store
  const draft = useSiteStore(state => state.draft);
  const currentPageId = useSiteStore(state => state.currentPageId);
  const theme = useSiteStore(state => state.theme);
  const dirty = useSiteStore(state => state.dirty);
  const hydrateDraft = useSiteStore(state => state.hydrateDraft);
  const markSaved = useSiteStore(state => state.markSaved);
  const updateSection = useSiteStore(state => state.updateSection);
  const addSection = useSiteStore(state => state.addSection);
  const deleteSection = useSiteStore(state => state.deleteSection);
  const setSections = useSiteStore(state => state.setSections);
  const setCurrentPage = useSiteStore(state => state.setCurrentPage);
  const setTheme = useSiteStore(state => state.setTheme);
  const updateNavbar = useSiteStore(state => state.updateNavbar);
  const setNavbar = useSiteStore(state => state.setNavbar);
  const clearSite = useSiteStore(state => state.clearSite);
  const updateSiteName = useSiteStore(state => state.updateSiteName);
  const addNewPage = useSiteStore(state => state.addNewPage);
  const deletePage = useSiteStore(state => state.deletePage);
  const updatePageSections = useSiteStore(state => state.updatePageSections);
  const undo = useSiteStore(state => state.undo);
  const redo = useSiteStore(state => state.redo);
  const canUndo = useSiteStore(state => state.canUndo);
  const canRedo = useSiteStore(state => state.canRedo);

  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingImageSections, setPendingImageSections] = useState<Set<string>>(new Set());
  const trackUsageRef = useRef<((usage: Usage) => void) | null>(null);

  // Hydrate draft when server site loads (only if not dirty)
  useEffect(() => {
    if (serverSite && !dirty) {
      hydrateDraft(serverSite);
    }
  }, [serverSite, dirty, hydrateDraft]);

  // Derive computed values from draft
  const site = draft ?? serverSite ?? createSite("Untitled Site");
  const sections = useMemo(() =>
    currentPageId && site?.pages?.[currentPageId] ? site.pages[currentPageId].sections : [],
  [currentPageId, site?.pages],
  );
  const navbar = draft?.navbar ?? null;
  const pageSlugs = useMemo(() => site?.pages ? Object.values(site.pages).map(p => p.slug) : [], [site?.pages]);
  const currentPage = currentPageId && site?.pages?.[currentPageId] ? site.pages[currentPageId] : undefined;
  const isGenerationComplete = site?.pages ? Object.values(site.pages).some(p => p.sections.length > 0) : false;
  const hasUnsavedChanges = dirty;

  // Save handler
  const handleSave = useCallback(() => {
    if (!draft || !dirty) return;

    saveSite(
      { site: draft, messages },
      {
        onSuccess: (savedSite) => {
          markSaved(savedSite);
        },
      },
    );
  }, [draft, dirty, messages, saveSite, markSaved]);

  // Persist usage costs to site
  const handleUsage = useCallback((usage: Usage) => {
    if (!draft) return;
    // Update costs directly in draft via applyDraftOp
    useSiteStore.getState().applyDraftOp((d) => {
      d.costs = [...(d.costs ?? []), usage];
      d.updatedAt = new Date().toISOString();
    });
  }, [draft]);

  // Store trackUsage function from Chat
  const handleTrackUsageReady = useCallback((trackUsage: (usage: Usage) => void) => {
    trackUsageRef.current = trackUsage;
  }, []);

  const handleSectionParsed = useCallback((section: Section) => {
    addSection(section);
    if (sectionNeedsImages(section.type as SectionType)) {
      setPendingImageSections(prev => new Set(prev).add(section.id));
    }
  }, [addSection]);

  const handleThemeSelected = useCallback((selection: ThemeSelection) => {
    setTheme(selection.palette, selection.typography, selection.effects);
  }, [setTheme]);

  const handleImages = useCallback((images: ImageSelection[], sections: Section[]) => {
    const bySection = groupBy(images, img => img.blockId);
    const resolvedSectionIds: string[] = [];

    for (const [sectionId, sectionImages] of Object.entries(bySection)) {
      const imgSources = sectionImages.map(s => s.image);
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        continue;
      }

      // Get injection config from preset or fallback to section type default
      const injection = section.preset
        ? getPresetImageInjection(section.preset)
        : getImageInjection(section.type as SectionType);

      if (injection) {
        const updates = applyImageInjection(section, imgSources, injection);
        if (Object.keys(updates).length > 0) {
          updateSection(sectionId, updates);
          resolvedSectionIds.push(sectionId);
        }
      }
    }

    if (resolvedSectionIds.length > 0) {
      setPendingImageSections((prev) => {
        const next = new Set(prev);
        for (const id of resolvedSectionIds) next.delete(id);
        return next;
      });
    }
  }, [updateSection]);

  const handleAddSection = useCallback(async (section: Section, index: number, generateWithAI = false) => {
    addSection(section, index);

    // early return if AI disabled
    if (!generateWithAI) {
      return;
    }

    // mark pending for image sections (only when AI enabled)
    if (sectionNeedsImages(section.type as SectionType)) {
      setPendingImageSections(prev => new Set(prev).add(section.id));
    }

    try {
      const token = await getToken();
      const response = await fetch("/api/chat/generate-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionType: section.type,
          preset: section.preset,
          siteContext: {
            name: site.name,
            description: site.description,
            location: site.location,
          },
          existingSections: sections,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const { section: populated, images, usage } = await response.json();

      // Track usage cost
      if (usage && trackUsageRef.current) {
        trackUsageRef.current(usage);
      }

      updateSection(section.id, populated);

      if (images.length > 0) {
        handleImages(images, [populated]);
      }

      setPendingImageSections((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
    catch (err) {
      console.error("Failed to generate content:", err);
      setPendingImageSections((prev) => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
  }, [addSection, getToken, site, sections, updateSection, handleImages]);

  const handlePages = useCallback((pages: PageInfo[], themeOverride?: ThemeSelection) => {
    // Use flushSync to ensure all state updates happen synchronously before React renders
    flushSync(() => {
      clearSite();

      // apply theme after clearSite (avoids stale closure issue)
      if (themeOverride) {
        setTheme(themeOverride.palette, themeOverride.typography, themeOverride.effects);
      }

      let firstPageId: string | null = null;
      for (const pageInfo of pages) {
        const pageId = addNewPage(pageInfo.slug, pageInfo.title);
        if (!firstPageId) firstPageId = pageId;
        updatePageSections(pageId, pageInfo.sections);
        for (const section of pageInfo.sections) {
          if (sectionNeedsImages(section.type as SectionType)) {
            setPendingImageSections(prev => new Set(prev).add(section.id));
          }
        }
      }

      if (pages.length > 1) {
        setNavbar({
          id: crypto.randomUUID(),
          type: "navbar",
          logo: { text: site.name },
          items: pages.map(p => ({ label: p.title, href: p.slug })),
          sticky: true,
          preset: "navbar-minimal",
        });
      }

      if (firstPageId) {
        setCurrentPage(firstPageId);
      }
    });
  }, [clearSite, addNewPage, updatePageSections, setCurrentPage, setNavbar, site, setTheme]);

  const handleRefine = useCallback((updates: RefineUpdate[]) => {
    for (const { sectionId, updates: sectionUpdates } of updates) {
      updateSection(sectionId, sectionUpdates);
    }
  }, [updateSection]);

  const handleMove = useCallback((moves: MoveUpdate[]) => {
    const currentSections = [...sections];
    for (const { sectionId, direction } of moves) {
      const index = currentSections.findIndex(s => s.id === sectionId);
      if (index === -1) continue;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentSections.length) continue;
      // skip if trying to move past footer
      if (direction === "down" && currentSections[newIndex]?.type === "footer") continue;
      const [moved] = currentSections.splice(index, 1);
      if (moved) currentSections.splice(newIndex, 0, moved);
    }
    setSections(currentSections);
  }, [sections, setSections]);

  const handleDelete = useCallback((sectionId: string) => {
    deleteSection(sectionId);
  }, [deleteSection]);

  const handleGenerationComplete = useCallback(() => {
    // No-op: history is always enabled with the new store
  }, []);

  return {
    // State
    site,
    sections,
    navbar,
    currentPage,
    currentPageId,
    pageSlugs,
    theme: { palette: theme.palette, typography: theme.typography, effects: theme.effects } as ThemeState,
    isGenerationComplete,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    messages,
    pendingImageSections,
    canUndo,
    canRedo,

    // Actions
    setCurrentPage,
    setSections,
    updateSiteName,
    addNewPage: (slug: string, title: string) => addNewPage(slug, title),
    deletePage,
    setNavbar,
    updateNavbar,
    undo,
    redo,
    handleSave,
    setMessages,
    handleUsage,
    handleTrackUsageReady,
    handleSectionParsed,
    handleThemeSelected,
    handleImages,
    handleAddSection,
    handlePages,
    handleRefine,
    handleMove,
    handleDelete,
    handleGenerationComplete,
    getToken: getToken as () => Promise<string | null>,
    trackUsage: trackUsageRef.current,
  };
}
