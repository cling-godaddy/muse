import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produceWithPatches, applyPatches, enablePatches, type Patch } from "immer";
import type { Site, Section, NavbarSection } from "@muse/core";

// Enable Immer patches plugin
enablePatches();

interface HistoryEntry {
  patches: Patch[]
  inversePatches: Patch[]
}

interface ThemeState {
  palette: string
  typography: string
  effects: string
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
  addNewPage: (slug: string, title: string) => string
  deletePage: (pageId: string) => void

  // History actions
  undo: () => void
  redo: () => void

  // Save coordination
  markSaved: (savedSite: Site) => void
  markSynced: () => void
}

export const useSiteStore = create<SiteState>()(
  devtools(
    (set, get) => ({
      draft: null,
      currentPageId: null,
      theme: { palette: "slate", typography: "inter", effects: "neutral" },
      undoStack: [],
      redoStack: [],
      dirty: false,

      hydrateDraft: (site) => {
        // Rebuild tree from pages if tree is empty (migration for old sites)
        const tree = site.tree.length > 0
          ? site.tree
          : Object.values(site.pages).map(page => ({
            pageId: page.id,
            slug: page.slug,
            children: [],
          }));

        set({
          draft: { ...site, tree },
          currentPageId: Object.keys(site.pages)[0] ?? null,
          theme: {
            palette: site.theme.palette,
            typography: site.theme.typography,
            effects: "neutral", // derive from palette
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

        set({ theme: { palette, typography, effects: resolvedEffects } });

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
          draft.tree = [];
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

      addNewPage: (slug, title) => {
        const { applyDraftOp } = get();
        const pageId = crypto.randomUUID();

        applyDraftOp((draft) => {
          draft.pages[pageId] = {
            id: pageId,
            slug,
            sections: [],
            meta: { title },
          };
          // Also add to tree so getPagesFlattened works
          draft.tree.push({ pageId, slug, children: [] });
          draft.updatedAt = new Date().toISOString();
        });

        return pageId;
      },

      deletePage: (pageId) => {
        const { applyDraftOp, currentPageId } = get();

        applyDraftOp((draft) => {
          draft.pages = Object.fromEntries(
            Object.entries(draft.pages).filter(([id]) => id !== pageId),
          );
          // Also remove from tree
          draft.tree = draft.tree.filter(node => node.pageId !== pageId);
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
    }),
    { name: "site-store" },
  ),
);
