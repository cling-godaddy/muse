import type { SectionType } from "@muse/core";

const PRESET_SECTION_TYPES: SectionType[] = [
  "hero",
  "features",
  "testimonials",
  "gallery",
  "pricing",
  "faq",
  "contact",
  "cta",
  "footer",
  "about",
  "subscribe",
  "stats",
  "logos",
];

export function supportsPresets(sectionType: string): boolean {
  return PRESET_SECTION_TYPES.includes(sectionType as SectionType);
}
