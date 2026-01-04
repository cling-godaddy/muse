import { useState, useCallback, useEffect } from "react";
import type { Site, Section, NavbarSection } from "@muse/core";
import { useSite, type UseSite } from "./useSite";
import { useHistory } from "./useHistory";

export interface ThemeState {
  palette: string
  typography: string
  effects: string
}

interface Snapshot {
  site: Site
  theme: ThemeState
  currentPageId: string | null
}

export interface UseSiteWithHistory extends Omit<UseSite, "setSite"> {
  // Full site replacement (for loading from persistence)
  setSite: (site: Site) => void

  // Theme state (moved here from app.tsx)
  theme: ThemeState
  setTheme: (palette: string, typography: string, effects?: string) => void

  // History controls
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  // Transaction API (for batching AI operations)
  beginTransaction: () => void
  commitTransaction: () => void
  rollbackTransaction: () => void

  // Enable history tracking (call after initial generation completes)
  enableHistory: () => void

  // Whether initial generation is complete (history is enabled)
  isGenerationComplete: boolean
}

const DEFAULT_THEME: ThemeState = {
  palette: "slate",
  typography: "inter",
  effects: "neutral",
};

export function useSiteWithHistory(initialName = "Untitled Site"): UseSiteWithHistory {
  const siteHook = useSite(initialName);
  const [theme, setThemeState] = useState<ThemeState>(DEFAULT_THEME);
  const [historyEnabled, setHistoryEnabled] = useState(false);

  const initialSnapshot: Snapshot = {
    site: siteHook.site,
    theme: DEFAULT_THEME,
    currentPageId: siteHook.currentPageId,
  };

  const history = useHistory<Snapshot>(initialSnapshot);

  const snapshot = useCallback((): Snapshot => ({
    site: siteHook.site,
    theme,
    currentPageId: siteHook.currentPageId,
  }), [siteHook.site, siteHook.currentPageId, theme]);

  // Keep history's present in sync with current state (after mutations complete)
  useEffect(() => {
    if (historyEnabled) {
      history.setBaseline(snapshot());
    }
  }, [historyEnabled, history, snapshot]);

  // Wrapped mutations that push to history before executing (only when enabled)
  // Note: push() saves current present to past, then useEffect syncs present with new state
  const addSection = useCallback((section: Section, index?: number) => {
    if (historyEnabled) history.push();
    siteHook.addSection(section, index);
  }, [history, siteHook, historyEnabled]);

  const updateSection = useCallback((id: string, data: Partial<Section>) => {
    if (historyEnabled) history.push();
    siteHook.updateSection(id, data);
  }, [history, siteHook, historyEnabled]);

  const setSections = useCallback((sections: Section[]) => {
    if (historyEnabled) history.push();
    siteHook.setSections(sections);
  }, [history, siteHook, historyEnabled]);

  const updateSectionById = useCallback((id: string, data: Partial<Section>) => {
    if (historyEnabled) history.push();
    siteHook.updateSectionById(id, data);
  }, [history, siteHook, historyEnabled]);

  const addNewPage = useCallback((slug: string, title: string): string => {
    if (historyEnabled) history.push();
    return siteHook.addNewPage(slug, title);
  }, [history, siteHook, historyEnabled]);

  const deletePage = useCallback((pageId: string) => {
    if (historyEnabled) history.push();
    siteHook.deletePage(pageId);
  }, [history, siteHook, historyEnabled]);

  const updatePageSections = useCallback((pageId: string, sections: Section[]) => {
    if (historyEnabled) history.push();
    siteHook.updatePageSections(pageId, sections);
  }, [history, siteHook, historyEnabled]);

  const setNavbar = useCallback((navbar: NavbarSection) => {
    if (historyEnabled) history.push();
    siteHook.setNavbar(navbar);
  }, [history, siteHook, historyEnabled]);

  const clearSite = useCallback(() => {
    if (historyEnabled) history.push();
    siteHook.clearSite();
  }, [history, siteHook, historyEnabled]);

  // Theme mutation with history
  const setTheme = useCallback((palette: string, typography: string, effects?: string) => {
    if (historyEnabled) history.push();
    const resolvedEffects = effects
      ?? (palette === "terminal" ? "crt" : palette === "synthwave" ? "neon" : "neutral");
    setThemeState({ palette, typography, effects: resolvedEffects });
  }, [history, historyEnabled]);

  // Undo/redo that restore full state
  const undo = useCallback(() => {
    const restored = history.undo();
    if (restored) {
      siteHook.setSite(restored.site);
      const pageId = restored.currentPageId ?? Object.keys(restored.site.pages)[0];
      if (pageId) siteHook.setCurrentPage(pageId);
      setThemeState(restored.theme);
    }
  }, [history, siteHook]);

  const redo = useCallback(() => {
    const restored = history.redo();
    if (restored) {
      siteHook.setSite(restored.site);
      const pageId = restored.currentPageId ?? Object.keys(restored.site.pages)[0];
      if (pageId) siteHook.setCurrentPage(pageId);
      setThemeState(restored.theme);
    }
  }, [history, siteHook]);

  const rollbackTransaction = useCallback(() => {
    const restored = history.rollbackTransaction();
    if (restored) {
      siteHook.setSite(restored.site);
      const pageId = restored.currentPageId ?? Object.keys(restored.site.pages)[0];
      if (pageId) siteHook.setCurrentPage(pageId);
      setThemeState(restored.theme);
    }
  }, [history, siteHook]);

  const enableHistory = useCallback(() => {
    setHistoryEnabled(true);
    // Note: useEffect will sync present with current state when historyEnabled changes
  }, []);

  // Full site replacement (for loading from persistence)
  const setSite = useCallback((newSite: Site) => {
    siteHook.setSite(newSite);
    // Set theme from loaded site
    setThemeState(prev => ({
      ...prev,
      palette: newSite.theme.palette,
      typography: newSite.theme.typography,
    }));
    // Select first page
    const firstPageId = Object.keys(newSite.pages)[0];
    if (firstPageId) {
      siteHook.setCurrentPage(firstPageId);
    }
  }, [siteHook]);

  return {
    // Pass through read-only state
    site: siteHook.site,
    currentPageId: siteHook.currentPageId,
    currentPage: siteHook.currentPage,
    pageSlugs: siteHook.pageSlugs,
    sections: siteHook.sections,
    setCurrentPage: siteHook.setCurrentPage,

    // Full site replacement
    setSite,

    // Theme state
    theme,
    setTheme,

    // Wrapped mutations
    addSection,
    updateSection,
    setSections,
    updateSectionById,
    addNewPage,
    deletePage,
    updatePageSections,
    setNavbar,
    clearSite,

    // History controls
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,

    // Transaction API
    beginTransaction: history.beginTransaction,
    commitTransaction: history.commitTransaction,
    rollbackTransaction,

    // Enable history tracking (call after initial generation completes)
    enableHistory,

    // Whether initial generation is complete
    isGenerationComplete: historyEnabled,
  };
}
