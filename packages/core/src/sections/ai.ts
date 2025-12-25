import type { SectionType } from "./types";
import { getPresetsForType } from "./index";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "features",
  "testimonials",
  "gallery",
  "pricing",
  "faq",
  "contact",
  "cta",
];

export function generateSectionPrompt(): string {
  const sections = SECTION_TYPES.map((sectionType) => {
    const presets = getPresetsForType(sectionType);
    const presetLines = presets.map(p =>
      `  - ${p.id}: ${p.description} [${p.mood}, ${p.industries.slice(0, 2).join("/")}]`,
    );
    return `${sectionType.toUpperCase()}:\n${presetLines.join("\n")}`;
  });

  return sections.join("\n\n");
}
