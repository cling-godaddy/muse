import { useEffect, useRef } from "react";
import type { Section } from "@muse/core";
import { usePatchSection } from "../queries/siteQueries";
import { useSiteStore } from "../stores/siteStore";

export function useAutosaveSection() {
  const patchSection = usePatchSection();
  const draft = useSiteStore(state => state.draft);
  const dirty = useSiteStore(state => state.dirty);
  const markSynced = useSiteStore(state => state.markSynced);

  // Read siteId from global state
  const siteId = draft?.id;

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevDraftRef = useRef(draft);

  // Initialize prevDraftRef when draft first loads
  useEffect(() => {
    if (draft && !prevDraftRef.current) {
      prevDraftRef.current = draft;
    }
  }, [draft]);

  // Reset baseline when dirty becomes false (after save completes)
  // This ensures new sections from generation become the baseline for future edits
  useEffect(() => {
    if (!dirty && draft) {
      prevDraftRef.current = draft;
    }
  }, [dirty, draft]);

  useEffect(() => {
    if (!dirty || !draft || !siteId) return;

    // Clear existing timer
    clearTimeout(timerRef.current);

    // Debounce: wait 500ms after last change
    timerRef.current = setTimeout(async () => {
      const prev = prevDraftRef.current;
      if (!prev) {
        prevDraftRef.current = draft;
        return;
      }

      // Find changed sections by comparing prev vs current
      const changedSections: Array<{ sectionId: string, pageId: string, updates: Section }> = [];

      for (const [pageId, page] of Object.entries(draft.pages)) {
        const prevPage = prev.pages[pageId];
        if (!prevPage) continue; // New page, skip for now

        for (const section of page.sections) {
          const prevSection = prevPage.sections.find(s => s.id === section.id);
          if (!prevSection) continue; // New section, skip for now

          // Simple deep equality check - if sections differ, PATCH it
          if (JSON.stringify(prevSection) !== JSON.stringify(section)) {
            changedSections.push({
              sectionId: section.id,
              pageId,
              updates: section,
            });
          }
        }
      }

      if (changedSections.length > 0) {
        // Update baseline IMMEDIATELY before async PATCH to prevent race condition
        prevDraftRef.current = draft;

        // Send PATCH for each changed section
        for (const { sectionId, updates } of changedSections) {
          try {
            await patchSection.mutateAsync({ siteId, sectionId, updates });
          }
          catch (err) {
            console.error(`Failed to patch section ${sectionId}:`, err);
            // TODO: Show error to user, add retry logic
          }
        }

        // Mark as synced after all PATCHes succeed
        if (!patchSection.isError) {
          markSynced();
        }
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [draft, dirty, siteId, patchSection, markSynced]);

  return {
    isSyncing: patchSection.isPending,
    syncError: patchSection.error,
  };
}
