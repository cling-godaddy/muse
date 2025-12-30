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
  "footer",
  "about",
  "subscribe",
  "stats",
  "logos",
];

export function supportsPresets(blockType: string): boolean {
  return PRESET_BLOCK_TYPES.includes(blockType as SectionType);
}
