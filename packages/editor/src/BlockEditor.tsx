import type { Section, NavbarConfig, NavbarSection } from "@muse/core";
import { Section as SectionWrapper, Navbar } from "./sections";
import { SelectionProvider } from "./context/Selection";

interface SectionEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
  pendingImageSections?: Set<string>
  navbar?: NavbarConfig
  onNavbarChange?: (navbar: NavbarConfig) => void
}

// Convert NavbarConfig to NavbarSection format for the Navbar component
function toNavbarSection(config: NavbarConfig): NavbarSection {
  return {
    id: "site-navbar",
    type: "navbar",
    logo: config.logo,
    items: (config.items ?? []).map(item => ({ label: item.label, href: item.href })),
    cta: config.cta,
  };
}

export function SectionEditor({ sections, onChange, pendingImageSections, navbar, onNavbarChange }: SectionEditorProps) {
  const updateSection = (id: string, data: Partial<Section>) => {
    onChange(sections.map(s => (s.id === id ? { ...s, ...data } as Section : s)));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const handleNavbarUpdate = (data: Partial<NavbarSection>) => {
    if (!navbar || !onNavbarChange) return;
    onNavbarChange({
      ...navbar,
      logo: data.logo ?? navbar.logo,
      items: data.items?.map(item => ({ label: item.label, href: item.href })) ?? navbar.items,
      cta: data.cta ?? navbar.cta,
    });
  };

  return (
    <SelectionProvider>
      <div className="muse-section-editor">
        {navbar && (
          <Navbar
            section={toNavbarSection(navbar)}
            onUpdate={handleNavbarUpdate}
          />
        )}
        {sections.length === 0 && !navbar && (
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
