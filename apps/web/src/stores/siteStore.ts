import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produceWithPatches, applyPatches, enablePatches, type Patch } from "immer";
import type { Site, Section, NavbarSection } from "@muse/core";
import { resolveTheme, type Theme } from "@muse/themes";

// Enable Immer patches plugin
enablePatches();

interface HistoryEntry {
  patches: Patch[]
  inversePatches: Patch[]
}

const defaultResolved = resolveTheme({ palette: "slate", typography: "inter" });

interface ThemeState {
  palette: string
  typography: string
  effects: string
  resolved: Theme
}

interface SiteState {
  // Draft state
  draft: Site | null
  currentPageId: string | null
  theme: ThemeState

  // History
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]
  dirty: boolean

  // Image loading state
  pendingImageSections: Set<string>

  // Actions
  hydrateDraft: (site: Site) => void
  applyDraftOp: (recipe: (draft: Site) => void) => void
  updateSection: (id: string, data: Partial<Section>) => void
  addSection: (section: Section, index?: number) => void
  deleteSection: (id: string) => void
  setSections: (sections: Section[]) => void
  updatePageSections: (pageId: string, sections: Section[]) => void
  setCurrentPage: (pageId: string) => void
  setTheme: (palette: string, typography: string, effects?: string) => void
  updateNavbar: (data: Partial<NavbarSection>) => void
  setNavbar: (navbar: NavbarSection | null) => void
  clearSite: () => void
  updateSiteName: (name: string) => void
  addNewPage: (slug: string, title: string, parentId?: string | null) => string
  deletePage: (pageId: string) => void

  // History actions
  undo: () => void
  redo: () => void

  // Save coordination
  markSaved: (savedSite: Site) => void
  markSynced: () => void

  // Image loading actions
  addPendingImageSection: (id: string) => void
  removePendingImageSections: (ids: string[]) => void
  clearPendingImageSections: () => void

  // Full reset
  resetStore: () => void
}

export const useSiteStore = create<SiteState>()(
  devtools(
    (set, get) => ({
      draft: null,
      currentPageId: null,
      theme: { palette: "slate", typography: "inter", effects: "neutral", resolved: defaultResolved },
      undoStack: [],
      redoStack: [],
      dirty: false,
      pendingImageSections: new Set(),

      hydrateDraft: (site) => {
        const { palette, typography } = site.theme;
        const resolved = resolveTheme({ palette, typography });

        // Migration: ensure all pages have parentId and order
        const migratedPages = Object.fromEntries(
          Object.entries(site.pages).map(([id, page], index) => [
            id,
            {
              ...page,
              parentId: page.parentId ?? null,
              order: page.order ?? index,
            },
          ]),
        );

        set({
          draft: { ...site, pages: migratedPages },
          currentPageId: Object.keys(site.pages)[0] ?? null,
          theme: {
            palette,
            typography,
            effects: "neutral",
            resolved,
          },
          undoStack: [],
          redoStack: [],
          dirty: false,
        });
      },

      applyDraftOp: recipe => set((state) => {
        if (!state.draft) return state;

        const [nextDraft, patches, inversePatches] = produceWithPatches(
          state.draft,
          recipe,
        );

        if (patches.length === 0) return state;

        return {
          draft: nextDraft,
          undoStack: [...state.undoStack, { patches, inversePatches }],
          redoStack: [],
          dirty: true,
        };
      }),

      updateSection: (id, data) => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          // Find section across all pages
          for (const page of Object.values(draft.pages)) {
            const section = page.sections.find(s => s.id === id);
            if (section) {
              Object.assign(section, data);
              draft.updatedAt = new Date().toISOString();
              return;
            }
          }
        });
      },

      addSection: (section, index) => {
        const { applyDraftOp, currentPageId } = get();
        if (!currentPageId) return;

        applyDraftOp((draft) => {
          const page = draft.pages[currentPageId];
          if (!page) return;

          if (index === undefined) {
            page.sections.push(section);
          }
          else {
            page.sections.splice(index, 0, section);
          }
          draft.updatedAt = new Date().toISOString();
        });
      },

      deleteSection: (id) => {
        const { applyDraftOp, currentPageId } = get();
        if (!currentPageId) return;

        applyDraftOp((draft) => {
          const page = draft.pages[currentPageId];
          if (!page) return;

          page.sections = page.sections.filter(s => s.id !== id);
          draft.updatedAt = new Date().toISOString();
        });
      },

      setSections: (sections) => {
        const { applyDraftOp, currentPageId } = get();
        if (!currentPageId) return;

        applyDraftOp((draft) => {
          const page = draft.pages[currentPageId];
          if (!page) return;

          page.sections = sections;
          draft.updatedAt = new Date().toISOString();
        });
      },

      updatePageSections: (pageId, sections) => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          const page = draft.pages[pageId];
          if (!page) return;

          page.sections = sections;
          draft.updatedAt = new Date().toISOString();
        });
      },

      setCurrentPage: pageId => set({ currentPageId: pageId }),

      setTheme: (palette, typography, effects) => {
        const { applyDraftOp } = get();
        const resolvedEffects = effects
          ?? (palette === "terminal" ? "crt" : palette === "synthwave" ? "neon" : "neutral");
        const resolved = resolveTheme({ palette, typography });

        set({ theme: { palette, typography, effects: resolvedEffects, resolved } });

        applyDraftOp((draft) => {
          draft.theme = { palette, typography };
          draft.updatedAt = new Date().toISOString();
        });
      },

      updateNavbar: (data) => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          if (!draft.navbar) return;
          Object.assign(draft.navbar, data);
          draft.updatedAt = new Date().toISOString();
        });
      },

      setNavbar: (navbar) => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          draft.navbar = navbar ?? undefined;
          draft.updatedAt = new Date().toISOString();
        });
      },

      clearSite: () => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          // Clear pages but preserve site metadata
          draft.pages = {};
          draft.navbar = undefined;
          draft.updatedAt = new Date().toISOString();
        });
      },

      updateSiteName: (name) => {
        const { applyDraftOp } = get();

        applyDraftOp((draft) => {
          draft.name = name;
          draft.updatedAt = new Date().toISOString();
        });
      },

      addNewPage: (slug, title, parentId = null) => {
        const { applyDraftOp } = get();
        const pageId = crypto.randomUUID();

        applyDraftOp((draft) => {
          // Compute order (append to end of siblings)
          const siblings = Object.values(draft.pages).filter(p => p.parentId === parentId);
          const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : -1;

          draft.pages[pageId] = {
            id: pageId,
            slug,
            parentId,
            order: maxOrder + 1,
            sections: [],
            meta: { title },
          };
          draft.updatedAt = new Date().toISOString();
        });

        return pageId;
      },

      deletePage: (pageId) => {
        const { applyDraftOp, currentPageId } = get();

        applyDraftOp((draft) => {
          // Find all descendants (cascade delete)
          function getDescendants(id: string): string[] {
            const children = Object.values(draft.pages).filter(p => p.parentId === id);
            return children.flatMap(c => [c.id, ...getDescendants(c.id)]);
          }
          const toDelete = new Set([pageId, ...getDescendants(pageId)]);

          draft.pages = Object.fromEntries(
            Object.entries(draft.pages).filter(([id]) => !toDelete.has(id)),
          );
          draft.updatedAt = new Date().toISOString();
        });

        // If deleting current page, switch to first available
        if (currentPageId === pageId) {
          const state = get();
          const remaining = state.draft ? Object.keys(state.draft.pages) : [];
          set({ currentPageId: remaining[0] ?? null });
        }
      },

      undo: () => set((state) => {
        if (!state.draft || state.undoStack.length === 0) return state;

        const last = state.undoStack.at(-1);
        if (!last) return state;

        return {
          ...state,
          draft: applyPatches(state.draft, last.inversePatches),
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, last],
          dirty: true,
        };
      }),

      redo: () => set((state) => {
        if (!state.draft || state.redoStack.length === 0) return state;

        const last = state.redoStack.at(-1);
        if (!last) return state;

        return {
          ...state,
          draft: applyPatches(state.draft, last.patches),
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, last],
          dirty: true,
        };
      }),

      markSaved: savedSite => set({
        draft: savedSite,
        dirty: false,
        undoStack: [],
        redoStack: [],
      }),

      markSynced: () => set({
        dirty: false,
      }),

      addPendingImageSection: id => set(state => ({
        pendingImageSections: new Set(state.pendingImageSections).add(id),
      })),

      removePendingImageSections: ids => set((state) => {
        const next = new Set(state.pendingImageSections);
        for (const id of ids) next.delete(id);
        return { pendingImageSections: next };
      }),

      clearPendingImageSections: () => set({
        pendingImageSections: new Set(),
      }),

      resetStore: () => set({
        draft: null,
        currentPageId: null,
        theme: { palette: "slate", typography: "inter", effects: "neutral", resolved: defaultResolved },
        undoStack: [],
        redoStack: [],
        dirty: false,
        pendingImageSections: new Set(),
      }),
    }),
    { name: "site-store" },
  ),
);
