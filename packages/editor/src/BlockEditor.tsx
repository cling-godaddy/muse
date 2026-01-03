import { useMemo } from "react";
import type { Section, NavbarSection } from "@muse/core";
import { Section as SectionWrapper } from "./sections";
import { SelectionProvider } from "./context/Selection";

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  pendingImageSections?: Set<string>
  navbar?: NavbarSection
  onNavbarChange?: (navbar: NavbarSection) => void
}

export function SectionEditor({ sections, onChange, pendingImageSections, navbar, onNavbarChange }: SectionEditorProps) {
  // Combine navbar with sections for unified rendering
  // Ensure navbar has required fields (handles legacy data without type)
  const allSections = useMemo(() => {
    if (navbar && navbar.type === "navbar") {
      return [navbar as Section, ...sections];
    }
    return sections;
  }, [navbar, sections]);

  const updateSection = (id: string, data: Partial<Section>) => {
    // Check if updating navbar
    if (navbar && id === navbar.id) {
      onNavbarChange?.({ ...navbar, ...data } as NavbarSection);
      return;
    }
    onChange(sections.map(s => (s.id === id ? { ...s, ...data } as Section : s)));
  };

  const deleteSection = (id: string) => {
    // Don't allow deleting navbar for now
    if (navbar && id === navbar.id) return;
    onChange(sections.filter(s => s.id !== id));
  };

  return (
    <SelectionProvider>
      <div className="muse-section-editor">
        {allSections.length === 0 && (
          <div className="muse-section-editor-empty">
            No sections yet. Use AI to generate content.
          </div>
        )}
        {allSections.map(section => (
          <SectionWrapper
            key={section.id}
            section={section}
            onUpdate={data => updateSection(section.id, data)}
            onDelete={() => deleteSection(section.id)}
            isPending={pendingImageSections?.has(section.id) ?? false}
          />
        ))}
      </div>
    </SelectionProvider>
  );
}
