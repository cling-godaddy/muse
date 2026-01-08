import { describe, it, expect, beforeEach } from "vitest";
import { useSiteStore } from "./siteStore";
import { createSite } from "@muse/core";
import { resolveTheme } from "@muse/themes";

const defaultResolved = resolveTheme({ palette: "slate", typography: "inter" });

describe("siteStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useSiteStore.setState({
      draft: null,
      currentPageId: null,
      theme: { palette: "slate", typography: "inter", effects: "neutral", resolved: defaultResolved },
      undoStack: [],
      redoStack: [],
      dirty: false,
      pendingImageSections: new Set(),
    });
  });

  describe("hydrateDraft", () => {
    it("should initialize draft from server site", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);

      const state = useSiteStore.getState();
      expect(state.draft).toEqual(site);
      expect(state.currentPageId).toBe(pageId);
      expect(state.dirty).toBe(false);
      expect(state.undoStack).toHaveLength(0);
    });

    it("should resolve theme with design tokens", () => {
      const site = createSite("Test Site");
      site.theme = { palette: "indigo", typography: "inter" };
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);

      const { theme } = useSiteStore.getState();
      expect(theme.palette).toBe("indigo");
      expect(theme.resolved.colors.background).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.resolved.colors.backgroundAlt).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.resolved.colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe("patch-based undo/redo", () => {
    it("should create patches for mutations", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("New Name");

      const state = useSiteStore.getState();
      expect(state.draft?.name).toBe("New Name");
      expect(state.undoStack).toHaveLength(1);
      expect(state.dirty).toBe(true);
    });

    it("should undo mutations using inverse patches", () => {
      const site = createSite("Original Name");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("New Name");
      useSiteStore.getState().undo();

      const state = useSiteStore.getState();
      expect(state.draft?.name).toBe("Original Name");
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(1);
    });

    it("should redo mutations using patches", () => {
      const site = createSite("Original Name");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("New Name");
      useSiteStore.getState().undo();
      useSiteStore.getState().redo();

      const state = useSiteStore.getState();
      expect(state.draft?.name).toBe("New Name");
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(0);
    });

    it("should clear redo stack on new mutation", () => {
      const site = createSite("Original Name");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("Name 1");
      useSiteStore.getState().undo();
      useSiteStore.getState().updateSiteName("Name 2");

      const state = useSiteStore.getState();
      expect(state.draft?.name).toBe("Name 2");
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe("updateSection", () => {
    it("should update section across all pages", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      const sectionId = crypto.randomUUID();

      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [
          {
            id: sectionId,
            type: "hero",
            preset: "hero-default",
            headline: "Old Headline",
          },
        ],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSection(sectionId, { headline: "New Headline" });

      const state = useSiteStore.getState();
      const section = state.draft?.pages[pageId]?.sections[0];
      expect(section).toMatchObject({
        id: sectionId,
        headline: "New Headline",
      });
      expect(state.dirty).toBe(true);
    });
  });

  describe("markSaved", () => {
    it("should clear dirty flag and history", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("New Name");

      expect(useSiteStore.getState().dirty).toBe(true);
      expect(useSiteStore.getState().undoStack).toHaveLength(1);

      const savedSite = { ...site, name: "New Name" };
      useSiteStore.getState().markSaved(savedSite);

      const state = useSiteStore.getState();
      expect(state.dirty).toBe(false);
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe("pendingImageSections", () => {
    it("should add section to pending set", () => {
      useSiteStore.getState().addPendingImageSection("section-1");
      useSiteStore.getState().addPendingImageSection("section-2");

      const state = useSiteStore.getState();
      expect(state.pendingImageSections.size).toBe(2);
      expect(state.pendingImageSections.has("section-1")).toBe(true);
      expect(state.pendingImageSections.has("section-2")).toBe(true);
    });

    it("should remove sections from pending set", () => {
      useSiteStore.getState().addPendingImageSection("section-1");
      useSiteStore.getState().addPendingImageSection("section-2");
      useSiteStore.getState().addPendingImageSection("section-3");

      useSiteStore.getState().removePendingImageSections(["section-1", "section-3"]);

      const state = useSiteStore.getState();
      expect(state.pendingImageSections.size).toBe(1);
      expect(state.pendingImageSections.has("section-2")).toBe(true);
    });

    it("should clear all pending sections", () => {
      useSiteStore.getState().addPendingImageSection("section-1");
      useSiteStore.getState().addPendingImageSection("section-2");

      useSiteStore.getState().clearPendingImageSections();

      const state = useSiteStore.getState();
      expect(state.pendingImageSections.size).toBe(0);
    });
  });

  describe("derived selectors", () => {
    it("isGenerationComplete should be false when no pages have sections", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);

      const state = useSiteStore.getState();
      const isGenerationComplete = state.draft?.pages
        ? Object.values(state.draft.pages).some(p => p.sections.length > 0)
        : false;
      expect(isGenerationComplete).toBe(false);
    });

    it("isGenerationComplete should be true when any page has sections", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [{ id: "s1", type: "hero", preset: "hero-default", headline: "Welcome" }],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);

      const state = useSiteStore.getState();
      const isGenerationComplete = state.draft?.pages
        ? Object.values(state.draft.pages).some(p => p.sections.length > 0)
        : false;
      expect(isGenerationComplete).toBe(true);
    });

    it("isLoadingImages should reflect pending image sections", () => {
      const state1 = useSiteStore.getState();
      expect(state1.pendingImageSections.size > 0).toBe(false);

      useSiteStore.getState().addPendingImageSection("section-1");

      const state2 = useSiteStore.getState();
      expect(state2.pendingImageSections.size > 0).toBe(true);
    });

    it("hasUnsavedChanges should reflect dirty flag", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      expect(useSiteStore.getState().dirty).toBe(false);

      useSiteStore.getState().updateSiteName("New Name");
      expect(useSiteStore.getState().dirty).toBe(true);

      useSiteStore.getState().markSynced();
      expect(useSiteStore.getState().dirty).toBe(false);
    });
  });

  describe("resetStore", () => {
    it("should clear all state", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
        parentId: null,
        order: 0,
        sections: [{ id: "s1", type: "hero", preset: "hero-default", headline: "Welcome" }],
        meta: { title: "Home" },
      };

      useSiteStore.getState().hydrateDraft(site);
      useSiteStore.getState().updateSiteName("New Name");
      useSiteStore.getState().addPendingImageSection("section-1");

      // Verify state is populated
      expect(useSiteStore.getState().draft).not.toBeNull();
      expect(useSiteStore.getState().dirty).toBe(true);
      expect(useSiteStore.getState().pendingImageSections.size).toBe(1);

      // Reset
      useSiteStore.getState().resetStore();

      // Verify all state is cleared
      const state = useSiteStore.getState();
      expect(state.draft).toBeNull();
      expect(state.currentPageId).toBeNull();
      expect(state.dirty).toBe(false);
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
      expect(state.pendingImageSections.size).toBe(0);
    });
  });
});
