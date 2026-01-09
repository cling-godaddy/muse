import { useMemo, useCallback, Fragment } from "react";
import type { Section, NavbarSection, Site, Page, Usage } from "@muse/core";
import { getPreset } from "@muse/core";
import { Section as SectionWrapper } from "./sections";
import { SectionGap } from "./sections/SectionGap";
import { createSectionFromPreset } from "./sections/sectionFactory";
import { SelectionProvider } from "./context/Selection";
import { EditorServicesProvider } from "./context/EditorServices";
import { useIsEditable } from "./context/EditorMode";

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  navbar?: NavbarSection
  onNavbarChange?: (navbar: NavbarSection) => void
  site?: Site
  currentPage?: Page
  onAddSection?: (section: Section, index: number, generateWithAI?: boolean) => void
  onUpdateSection: (sectionId: string, data: Partial<Section>) => void
  onMoveSection?: (sectionId: string, direction: "up" | "down") => void
  onDeleteSection?: (sectionId: string) => void
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
}

export function SectionEditor({
  sections,
  onChange,
  navbar,
  onNavbarChange,
  site,
  currentPage,
  onAddSection,
  onUpdateSection,
  onMoveSection,
  onDeleteSection,
  getToken,
  trackUsage,
}: SectionEditorProps) {
  const isEditable = useIsEditable();

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
    onUpdateSection(id, data);
  };

  const deleteSection = (id: string) => {
    if (navbar && id === navbar.id) return;

    // Call parent's delete handler if provided (triggers API call)
    if (onDeleteSection) {
      onDeleteSection(id);
    }
    else {
      // Fallback: update local state only
      onChange(sections.filter(s => s.id !== id));
    }
  };

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  }, [sections, onChange]);

  const handleAddSection = useCallback((index: number, presetId: string, generateWithAI: boolean) => {
    const preset = getPreset(presetId);
    if (!preset) return;

    const section = createSectionFromPreset(preset);

    if (onAddSection) {
      onAddSection(section, index, generateWithAI);
    }
    else {
      // fallback: insert directly into sections
      const next = [...sections];
      next.splice(index, 0, section);
      onChange(next);
    }
  }, [sections, onChange, onAddSection]);

  const lastIsFooter = sections.length > 0 && sections.at(-1)?.type === "footer";
  const lastMoveableIndex = lastIsFooter ? sections.length - 2 : sections.length - 1;

  // only show gaps if site and currentPage are provided
  const canAddSections = isEditable && site && currentPage;

  return (
    <EditorServicesProvider getToken={getToken} trackUsage={trackUsage} site={site}>
      <SelectionProvider>
        <div className="muse-section-editor">
          {allSections.length === 0 && isEditable && (
            <div className="muse-section-editor-empty">
              No sections yet. Use AI to generate content.
            </div>
          )}
          {canAddSections && (
            <SectionGap
              index={0}
              site={site}
              currentPage={currentPage}
              onAdd={handleAddSection}
            />
          )}
          {allSections.map((section) => {
            const isNavbar = navbar && section.id === navbar.id;
            const isFooter = section.type === "footer";
            const sectionIndex = isNavbar ? -1 : sections.findIndex(s => s.id === section.id);
            const showMoveControls = !isNavbar && !isFooter;

            return (
              <Fragment key={section.id}>
                <SectionWrapper
                  section={section}
                  onUpdate={data => updateSection(section.id, data)}
                  onDelete={() => deleteSection(section.id)}
                  onMoveUp={showMoveControls
                    ? () => {
                      onMoveSection?.(section.id, "up");
                      moveSection(sectionIndex, sectionIndex - 1);
                    }
                    : void 0}
                  onMoveDown={showMoveControls
                    ? () => {
                      onMoveSection?.(section.id, "down");
                      moveSection(sectionIndex, sectionIndex + 1);
                    }
                    : void 0}
                  canMoveUp={showMoveControls && sectionIndex > 0}
                  canMoveDown={showMoveControls && sectionIndex < lastMoveableIndex}
                  trackUsage={trackUsage}
                />
                {canAddSections && !isNavbar && (
                  <SectionGap
                    index={sectionIndex + 1}
                    site={site}
                    currentPage={currentPage}
                    onAdd={handleAddSection}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </SelectionProvider>
    </EditorServicesProvider>
  );
}
