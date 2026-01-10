import { useMemo, useCallback, Fragment } from "react";
import type { Section, Site, Page, Usage } from "@muse/core";
import { getPreset } from "@muse/core";
import { Section as SectionWrapper } from "./sections";
import { SectionGap } from "./sections/SectionGap";
import { createSectionFromPreset } from "./sections/sectionFactory";
import { SelectionProvider } from "./context/Selection";
import { EditorServicesProvider } from "./context/EditorServices";
import { EditActivationProvider } from "./context/EditActivation";
import { EditOverlay } from "./overlays/EditOverlay";
import { useIsEditable } from "./context/EditorMode";

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  sharedSections?: Section[]
  site?: Site
  currentPage?: Page
  onAddSection?: (section: Section, index: number, generateWithAI?: boolean) => void
  onUpdateSection: (sectionId: string, data: Partial<Section>) => void
  onMoveSection?: (sectionId: string, direction: "up" | "down") => void
  onDeleteSection?: (sectionId: string) => void
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
  /** Use static rendering with click-to-edit (experimental) */
  useStaticMode?: boolean
}

export function SectionEditor({
  sections,
  onChange,
  sharedSections = [],
  site,
  currentPage,
  onAddSection,
  onUpdateSection,
  onMoveSection,
  onDeleteSection,
  getToken,
  trackUsage,
  useStaticMode,
}: SectionEditorProps) {
  const isEditable = useIsEditable();

  // Combine shared sections (navbar at top, footer at bottom) with page sections
  const allSections = useMemo(() => {
    const topSections = sharedSections.filter(s => s.type === "navbar");
    const bottomSections = sharedSections.filter(s => s.type === "footer");
    return [...topSections, ...sections, ...bottomSections];
  }, [sharedSections, sections]);

  // Check if a section is shared (not deletable/movable by user in page context)
  const isSharedSection = useCallback((id: string) => {
    return sharedSections.some(s => s.id === id);
  }, [sharedSections]);

  const deleteSection = (id: string) => {
    // Don't allow deleting shared sections from page context
    if (isSharedSection(id)) return;

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

  // Handler for static mode field updates
  const handleSaveField = useCallback((sectionId: string, path: string, value: unknown) => {
    onUpdateSection(sectionId, { [path]: value } as Partial<Section>);
  }, [onUpdateSection]);

  return (
    <EditorServicesProvider getToken={getToken} trackUsage={trackUsage} site={site}>
      <SelectionProvider>
        <EditActivationProvider onSaveField={handleSaveField}>
          <EditOverlay />
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
              const isShared = isSharedSection(section.id);
              const isFooter = section.type === "footer";
              const sectionIndex = isShared ? -1 : sections.findIndex(s => s.id === section.id);
              const showMoveControls = !isShared && !isFooter;

              return (
                <Fragment key={section.id}>
                  <SectionWrapper
                    section={section}
                    onUpdate={data => onUpdateSection(section.id, data)}
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
                    useStaticMode={useStaticMode}
                  />
                  {canAddSections && !isShared && (
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
        </EditActivationProvider>
      </SelectionProvider>
    </EditorServicesProvider>
  );
}
