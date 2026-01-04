import { useState, useCallback } from "react";
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
}

const DEFAULT_THEME: ThemeState = {
  palette: "slate",
  typography: "inter",
  effects: "neutral",
};

export function useSiteWithHistory(initialName = "Untitled Site"): UseSiteWithHistory {
  const siteHook = useSite(initialName);
  const [theme, setThemeState] = useState<ThemeState>(DEFAULT_THEME);

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

  // Wrapped mutations that push history before executing
  const addSection = useCallback((section: Section, index?: number) => {
    history.push(snapshot());
    siteHook.addSection(section, index);
  }, [history, snapshot, siteHook]);

  const updateSection = useCallback((id: string, data: Partial<Section>) => {
    history.push(snapshot());
    siteHook.updateSection(id, data);
  }, [history, snapshot, siteHook]);

  const setSections = useCallback((sections: Section[]) => {
    history.push(snapshot());
    siteHook.setSections(sections);
  }, [history, snapshot, siteHook]);

  const updateSectionById = useCallback((id: string, data: Partial<Section>) => {
    history.push(snapshot());
    siteHook.updateSectionById(id, data);
  }, [history, snapshot, siteHook]);

  const addNewPage = useCallback((slug: string, title: string): string => {
    history.push(snapshot());
    return siteHook.addNewPage(slug, title);
  }, [history, snapshot, siteHook]);

  const deletePage = useCallback((pageId: string) => {
    history.push(snapshot());
    siteHook.deletePage(pageId);
  }, [history, snapshot, siteHook]);

  const updatePageSections = useCallback((pageId: string, sections: Section[]) => {
    history.push(snapshot());
    siteHook.updatePageSections(pageId, sections);
  }, [history, snapshot, siteHook]);

  const setNavbar = useCallback((navbar: NavbarSection) => {
    history.push(snapshot());
    siteHook.setNavbar(navbar);
  }, [history, snapshot, siteHook]);

  const clearSite = useCallback(() => {
    history.push(snapshot());
    siteHook.clearSite();
  }, [history, snapshot, siteHook]);

  // Theme mutation with history
  const setTheme = useCallback((palette: string, typography: string, effects?: string) => {
    history.push(snapshot());
    const resolvedEffects = effects
      ?? (palette === "terminal" ? "crt" : palette === "synthwave" ? "neon" : "neutral");
    setThemeState({ palette, typography, effects: resolvedEffects });
  }, [history, snapshot]);

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

  return {
    // Pass through read-only state
    site: siteHook.site,
    currentPageId: siteHook.currentPageId,
    currentPage: siteHook.currentPage,
    pageSlugs: siteHook.pageSlugs,
    sections: siteHook.sections,
    setCurrentPage: siteHook.setCurrentPage,

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
  };
}
