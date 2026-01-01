import { useState, useCallback } from "react";
import type { Section } from "@muse/core";

export interface UseSections {
  sections: Section[]
  addSection: (section: Section, index?: number) => void
  updateSection: (id: string, data: Partial<Section>) => void
  deleteSection: (id: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  setSections: (sections: Section[]) => void
  clearSections: () => void
}

export function useSections(initial: Section[] = []): UseSections {
  const [sections, setSectionsState] = useState<Section[]>(initial);

  const setSections = useCallback((newSections: Section[]) => {
    setSectionsState(newSections);
  }, []);

  const clearSections = useCallback(() => {
    setSectionsState([]);
  }, []);

  const addSection = useCallback((section: Section, index?: number) => {
    setSectionsState((prev) => {
      if (index === undefined) {
        return [...prev, section];
      }
      const next = [...prev];
      next.splice(index, 0, section);
      return next;
    });
  }, []);

  const updateSection = useCallback((id: string, data: Partial<Section>) => {
    setSectionsState(prev =>
      prev.map(s => (s.id === id ? { ...s, ...data } as Section : s)),
    );
  }, []);

  const deleteSection = useCallback((id: string) => {
    setSectionsState(prev => prev.filter(s => s.id !== id));
  }, []);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setSectionsState((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      const next = [...prev];
      const moved = next.splice(fromIndex, 1)[0];
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return {
    sections,
    addSection,
    updateSection,
    deleteSection,
    moveSection,
    setSections,
    clearSections,
  };
}
