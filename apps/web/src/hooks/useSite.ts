import { useState, useCallback, useMemo } from "react";
import type { Site, Page, Section } from "@muse/core";
import { createSite, createPage, addPage, removePage, getPagesFlattened } from "@muse/core";

export interface UseSite {
  site: Site
  currentPageId: string | null
  currentPage: Page | null
  pageSlugs: string[]

  // Page navigation
  setCurrentPage: (pageId: string) => void

  // Section operations (for current page)
  sections: Section[]
  addSection: (section: Section, index?: number) => void
  updateSection: (id: string, data: Partial<Section>) => void
  setSections: (sections: Section[]) => void

  // Section operations (site-wide)
  updateSectionById: (id: string, data: Partial<Section>) => void

  // Page operations
  addNewPage: (slug: string, title: string) => string
  deletePage: (pageId: string) => void
  updatePageSections: (pageId: string, sections: Section[]) => void

  // Site operations
  setTheme: (palette: string, typography: string) => void
  setSite: (site: Site) => void
  clearSite: () => void
}

export function useSite(initialName = "Untitled Site"): UseSite {
  const [{ site: initialSite, defaultPageId }] = useState(() => {
    const s = createSite(initialName);
    const page = createPage("/", { title: "Home" });
    return { site: addPage(s, page), defaultPageId: page.id };
  });
  const [site, setSiteState] = useState<Site>(initialSite);
  const [currentPageId, setCurrentPageId] = useState<string | null>(defaultPageId);

  const currentPage = useMemo(() => {
    if (!currentPageId) return null;
    return site.pages[currentPageId] ?? null;
  }, [site, currentPageId]);

  const sections = useMemo(() => {
    return currentPage?.sections ?? [];
  }, [currentPage]);

  const pageSlugs = useMemo(() => {
    return getPagesFlattened(site).map(fp => fp.path);
  }, [site]);

  const setCurrentPage = useCallback((pageId: string) => {
    if (site.pages[pageId]) {
      setCurrentPageId(pageId);
    }
  }, [site.pages]);

  const updatePageSections = useCallback((pageId: string, newSections: Section[]) => {
    setSiteState((prev) => {
      const page = prev.pages[pageId];
      if (!page) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: { ...page, sections: newSections },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const addSection = useCallback((section: Section, index?: number) => {
    if (!currentPageId) return;
    setSiteState((prev) => {
      const page = prev.pages[currentPageId];
      if (!page) return prev;
      const newSections = [...page.sections];
      if (index === undefined) {
        newSections.push(section);
      }
      else {
        newSections.splice(index, 0, section);
      }
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [currentPageId]: { ...page, sections: newSections },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentPageId]);

  const updateSection = useCallback((id: string, data: Partial<Section>) => {
    if (!currentPageId) return;
    setSiteState((prev) => {
      const page = prev.pages[currentPageId];
      if (!page) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [currentPageId]: {
            ...page,
            sections: page.sections.map(s =>
              s.id === id ? { ...s, ...data } as Section : s,
            ),
          },
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentPageId]);

  // Update a section by ID across ALL pages (for image injection)
  const updateSectionById = useCallback((id: string, data: Partial<Section>) => {
    setSiteState((prev) => {
      // Find which page contains this section
      for (const [pageId, page] of Object.entries(prev.pages)) {
        const sectionIndex = page.sections.findIndex(s => s.id === id);
        if (sectionIndex !== -1) {
          return {
            ...prev,
            pages: {
              ...prev.pages,
              [pageId]: {
                ...page,
                sections: page.sections.map(s =>
                  s.id === id ? { ...s, ...data } as Section : s,
                ),
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return prev;
    });
  }, []);

  const setSections = useCallback((newSections: Section[]) => {
    if (!currentPageId) return;
    updatePageSections(currentPageId, newSections);
  }, [currentPageId, updatePageSections]);

  const addNewPage = useCallback((slug: string, title: string): string => {
    const page = createPage(slug, { title });
    setSiteState(prev => addPage(prev, page));
    return page.id;
  }, []);

  const deletePage = useCallback((pageId: string) => {
    setSiteState((prev) => {
      const updated = removePage(prev, pageId);
      // If deleting current page, switch to first available
      if (currentPageId === pageId) {
        const remaining = Object.keys(updated.pages);
        setCurrentPageId(remaining[0] ?? null);
      }
      return updated;
    });
  }, [currentPageId]);

  const setTheme = useCallback((palette: string, typography: string) => {
    setSiteState(prev => ({
      ...prev,
      theme: { palette, typography },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const setSite = useCallback((newSite: Site) => {
    setSiteState(newSite);
    // Set current page to first page if available
    const pageIds = Object.keys(newSite.pages);
    setCurrentPageId(pageIds[0] ?? null);
  }, []);

  const clearSite = useCallback(() => {
    setSiteState(createSite(initialName));
    setCurrentPageId(null);
  }, [initialName]);

  return {
    site,
    currentPageId,
    currentPage,
    pageSlugs,
    setCurrentPage,
    sections,
    addSection,
    updateSection,
    updateSectionById,
    setSections,
    addNewPage,
    deletePage,
    updatePageSections,
    setTheme,
    setSite,
    clearSite,
  };
}
