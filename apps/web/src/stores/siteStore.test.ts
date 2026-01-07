import { describe, it, expect, beforeEach } from "vitest";
import { useSiteStore } from "./siteStore";
import { createSite } from "@muse/core";

describe("siteStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useSiteStore.setState({
      draft: null,
      currentPageId: null,
      theme: { palette: "slate", typography: "inter", effects: "neutral" },
      undoStack: [],
      redoStack: [],
      dirty: false,
    });
  });

  describe("hydrateDraft", () => {
    it("should initialize draft from server site", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
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
  });

  describe("patch-based undo/redo", () => {
    it("should create patches for mutations", () => {
      const site = createSite("Test Site");
      const pageId = crypto.randomUUID();
      site.pages[pageId] = {
        id: pageId,
        slug: "/",
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
});
