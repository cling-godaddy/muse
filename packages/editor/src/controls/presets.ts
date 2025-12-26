import type { SectionType } from "@muse/core";

const PRESET_BLOCK_TYPES: SectionType[] = [
  "hero",
  "features",
  "testimonials",
  "gallery",
  "pricing",
  "faq",
  "contact",
  "cta",
];

export function supportsPresets(blockType: string): boolean {
  return PRESET_BLOCK_TYPES.includes(blockType as SectionType);
}
