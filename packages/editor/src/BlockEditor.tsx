import type { Section } from "@muse/core";
import { Section as SectionWrapper } from "./sections";
import { SelectionProvider } from "./context/Selection";

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  pendingImageSections?: Set<string>
}

export function SectionEditor({ sections, onChange, pendingImageSections }: SectionEditorProps) {
  const updateSection = (id: string, data: Partial<Section>) => {
    onChange(sections.map(s => (s.id === id ? { ...s, ...data } as Section : s)));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  return (
    <SelectionProvider>
      <div className="muse-section-editor">
        {sections.length === 0 && (
          <div className="muse-section-editor-empty">
            No sections yet. Use AI to generate content.
          </div>
        )}
        {sections.map(section => (
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
