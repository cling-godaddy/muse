import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { useAuth } from "@clerk/clerk-react";
import { groupBy } from "lodash-es";
import type { Section, SectionType } from "@muse/core";
import { sectionNeedsImages, getPresetImageInjection, getImageInjection, applyImageInjection, createSite, getSiteThumbnailUrl } from "@muse/core";
import type { ImageSelection } from "@muse/media";
import type { Usage } from "@muse/ai";
import { useSiteStore } from "../stores/siteStore";
import { useSite, useSaveSite, usePatchPageSections, useCreateSection, useDeleteSection, usePatchSite } from "../queries/siteQueries";
import { useAutosaveSection } from "./useAutosaveSection";
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
  const patchPageSections = usePatchPageSections();
  const createSectionMutation = useCreateSection();
  const deleteSectionMutation = useDeleteSection();
  const patchSiteMutation = usePatchSite();

  // Autosave section edits
  const { isSyncing: isSyncingSections } = useAutosaveSection(siteId ?? "");

  // Aggregate all syncing states
  const isSyncing = isSyncingSections || patchPageSections.isPending || createSectionMutation.isPending || deleteSectionMutation.isPending;

  // Client state from store
  const draft = useSiteStore(state => state.draft);
  const currentPageId = useSiteStore(state => state.currentPageId);
  const theme = useSiteStore(state => state.theme);
  const dirty = useSiteStore(state => state.dirty);
  const hydrateDraft = useSiteStore(state => state.hydrateDraft);
  const markSaved = useSiteStore(state => state.markSaved);
  const markSynced = useSiteStore(state => state.markSynced);
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
  const canUndo = useSiteStore(state => state.undoStack.length > 0);
  const canRedo = useSiteStore(state => state.redoStack.length > 0);
  const pendingImageSections = useSiteStore(state => state.pendingImageSections);
  const addPendingImageSection = useSiteStore(state => state.addPendingImageSection);
  const removePendingImageSections = useSiteStore(state => state.removePendingImageSections);

  const [messages, setMessages] = useState<Message[]>([]);
  const trackUsageRef = useRef<((usage: Usage) => void) | null>(null);
  const lastAddedSectionIdRef = useRef<string | null>(null);
  const prevSiteIdRef = useRef<string | undefined>(siteId);

  // Reset store when siteId changes (must run before hydration)
  useLayoutEffect(() => {
    if (siteId !== prevSiteIdRef.current) {
      useSiteStore.setState({
        draft: null,
        currentPageId: null,
        undoStack: [],
        redoStack: [],
        dirty: false,
        pendingImageSections: new Set(),
      });
      prevSiteIdRef.current = siteId;
    }
  }, [siteId]);

  // Hydrate draft on initial load only (not on every serverSite change)
  useEffect(() => {
    if (serverSite && !draft) {
      hydrateDraft(serverSite);
    }
  }, [serverSite, draft, hydrateDraft]);

  // Auto-save theme changes
  const prevThemeRef = useRef<{ palette: string, typography: string } | null>(null);
  useEffect(() => {
    if (!siteId || !draft) return;

    const currentTheme = { palette: theme.palette, typography: theme.typography };

    // Initialize ref on first run
    if (!prevThemeRef.current) {
      prevThemeRef.current = currentTheme;
      return;
    }

    // Check if theme actually changed
    if (
      prevThemeRef.current.palette === currentTheme.palette
      && prevThemeRef.current.typography === currentTheme.typography
    ) {
      return;
    }

    // Theme changed - patch it
    prevThemeRef.current = currentTheme;
    patchSiteMutation.mutate(
      { siteId, fields: { theme: currentTheme } },
      { onSuccess: () => markSynced() },
    );
  }, [siteId, draft, theme.palette, theme.typography, patchSiteMutation, markSynced]);

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
  const handleUsage = useCallback(async (usage: Usage) => {
    // Read current state directly to avoid stale closure issues
    const currentDraft = useSiteStore.getState().draft;
    if (!currentDraft) return;

    // Update local state
    useSiteStore.getState().applyDraftOp((d) => {
      d.costs = [...(d.costs ?? []), usage];
      d.updatedAt = new Date().toISOString();
    });

    // Persist to backend with targeted PATCH (avoids overwriting other data)
    try {
      const token = await getToken();
      await fetch(`/api/sites/${currentDraft.id}/costs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(usage),
      });
    }
    catch (err) {
      console.error("Failed to persist usage cost:", err);
    }
  }, [getToken]);

  // Store trackUsage function from Chat
  const handleTrackUsageReady = useCallback((trackUsage: (usage: Usage) => void) => {
    trackUsageRef.current = trackUsage;
  }, []);

  const clearLastAddedSection = useCallback(() => {
    lastAddedSectionIdRef.current = null;
  }, []);

  const handleSectionParsed = useCallback((section: Section) => {
    addSection(section);
    if (sectionNeedsImages(section.type as SectionType)) {
      addPendingImageSection(section.id);
    }
  }, [addSection, addPendingImageSection]);

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
      removePendingImageSections(resolvedSectionIds);
    }
  }, [updateSection, removePendingImageSections]);

  const handleAddSection = useCallback(async (section: Section, index: number, generateWithAI = false) => {
    // Store section ID for scrolling
    lastAddedSectionIdRef.current = section.id;

    // Add to local state (optimistic update)
    addSection(section, index);

    // Immediately sync to backend
    if (siteId && currentPageId) {
      try {
        await createSectionMutation.mutateAsync({
          siteId,
          pageId: currentPageId,
          section,
          index,
        });
        markSynced(); // Clear dirty flag after successful sync
      }
      catch (err) {
        console.error("Failed to sync section creation:", err);
        // TODO: Show error to user, add retry logic
      }
    }

    // early return if AI disabled
    if (!generateWithAI) {
      return;
    }

    // mark pending for image sections (only when AI enabled)
    if (sectionNeedsImages(section.type as SectionType)) {
      addPendingImageSection(section.id);
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

      removePendingImageSections([section.id]);
    }
    catch (err) {
      console.error("Failed to generate content:", err);
      removePendingImageSections([section.id]);
    }
  }, [addSection, siteId, currentPageId, createSectionMutation, markSynced, getToken, site, sections, updateSection, handleImages, addPendingImageSection, removePendingImageSections]);

  const handlePages = useCallback((pages: PageInfo[], themeOverride?: ThemeSelection) => {
    // Ensure draft is initialized before making changes
    const currentDraft = useSiteStore.getState().draft;
    if (!currentDraft) {
      console.error("[handlePages] draft is null - initializing from site");
      hydrateDraft(site);
    }

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
            addPendingImageSection(section.id);
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
  }, [clearSite, addNewPage, updatePageSections, setCurrentPage, setNavbar, site, setTheme, hydrateDraft, addPendingImageSection]);

  const handleRefine = useCallback((updates: RefineUpdate[]) => {
    for (const { sectionId, updates: sectionUpdates } of updates) {
      updateSection(sectionId, sectionUpdates);
    }
  }, [updateSection]);

  const handleSectionsUpdated = useCallback((updatedSections: Section[]) => {
    // Replace sections for current page with updated sections from backend
    setSections(updatedSections);
  }, [setSections]);

  const handleMove = useCallback(async (moves: MoveUpdate[]) => {
    if (!siteId || !currentPageId) return;

    // Apply all moves to sections array
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

    // Update local state (optimistic update + undo/redo)
    setSections(currentSections);

    // Immediately sync to backend
    try {
      await patchPageSections.mutateAsync({
        siteId,
        pageId: currentPageId,
        sections: currentSections,
      });
      markSynced(); // Clear dirty flag after successful sync
    }
    catch (err) {
      console.error("Failed to sync AI moves:", err);
      // TODO: Show error to user, add retry logic
    }
  }, [sections, setSections, siteId, currentPageId, patchPageSections, markSynced]);

  const handleDelete = useCallback(async (sectionId: string) => {
    if (!siteId || !currentPageId) return;

    // Delete from local state (optimistic update)
    deleteSection(sectionId);

    // Immediately sync to backend
    try {
      await deleteSectionMutation.mutateAsync({
        siteId,
        pageId: currentPageId,
        sectionId,
      });
      markSynced(); // Clear dirty flag after successful sync
    }
    catch (err) {
      console.error("Failed to delete section:", err);
      // TODO: Show error to user, add retry logic
    }
  }, [siteId, currentPageId, deleteSection, deleteSectionMutation, markSynced]);

  const handleMoveSection = useCallback(async (sectionId: string, direction: "up" | "down") => {
    if (!siteId || !currentPageId) return;

    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Skip if trying to move past footer
    if (direction === "down" && sections[newIndex]?.type === "footer") return;

    // Reorder sections locally (optimistic update)
    const reorderedSections = [...sections];
    const [moved] = reorderedSections.splice(index, 1);
    if (moved) {
      reorderedSections.splice(newIndex, 0, moved);
    }

    // Update local state for optimistic UI and undo/redo
    setSections(reorderedSections);

    // Immediately sync to backend
    try {
      await patchPageSections.mutateAsync({
        siteId,
        pageId: currentPageId,
        sections: reorderedSections,
      });
      markSynced(); // Clear dirty flag after successful sync
    }
    catch (err) {
      console.error("Failed to sync section move:", err);
      // TODO: Show error to user, add retry logic
    }
  }, [siteId, currentPageId, sections, setSections, patchPageSections, markSynced]);

  const handleGenerationComplete = useCallback(() => {
    // Read current state directly to avoid stale closure issues
    const currentState = useSiteStore.getState();
    const currentDraft = currentState.draft;
    const currentDirty = currentState.dirty;

    if (currentDraft && currentDirty) {
      // Save site structure - messages are saved separately via useAutosaveMessages
      saveSite(
        { site: currentDraft, messages: [] },
        {
          onSuccess: (savedSite) => {
            markSaved(savedSite);
            // Update thumbnail after save completes
            const thumbnailUrl = getSiteThumbnailUrl(savedSite);
            if (thumbnailUrl) {
              patchSiteMutation.mutate({ siteId: savedSite.id, fields: { thumbnailUrl } });
            }
          },
        },
      );
    }
  }, [saveSite, markSaved, patchSiteMutation]);

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
    isSyncing,
    isLoading,
    messages,
    pendingImageSections,
    canUndo,
    canRedo,

    // Actions
    setCurrentPage,
    setSections,
    updateSection,
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
    handleSectionsUpdated,
    handleMove,
    handleMoveSection,
    handleDelete,
    handleGenerationComplete,
    getToken: getToken as () => Promise<string | null>,
    trackUsage: handleUsage,
    lastAddedSectionId: lastAddedSectionIdRef.current,
    clearLastAddedSection,
  };
}
