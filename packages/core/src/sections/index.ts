export type {
  SectionType,
  LayoutPattern,
  SectionCategory,
  SectionPreset,
  PresetId,
  ImageCategory,
  ImageOrientation,
  ImageRequirements,
} from "./types";

export {
  heroPresets,
  featuresPresets,
  testimonialsPresets,
  galleryPresets,
  pricingPresets,
  faqPresets,
  contactPresets,
  ctaPresets,
  allPresets,
  type HeroPresetId,
  type FeaturesPresetId,
  type TestimonialsPresetId,
  type GalleryPresetId,
  type PricingPresetId,
  type FaqPresetId,
  type ContactPresetId,
  type CtaPresetId,
} from "./presets";

import type { SectionPreset, SectionType, ImageRequirements } from "./types";
import { allPresets } from "./presets";

export const DEFAULT_PRESETS: Record<SectionType, string> = {
  hero: "hero-centered",
  features: "features-grid-icons",
  testimonials: "testimonials-carousel",
  gallery: "gallery-grid",
  pricing: "pricing-cards",
  faq: "faq-accordion",
  contact: "contact-form",
  cta: "cta-centered",
};

export const GALLERY_IMAGE_MINIMUMS: Record<string, number> = {
  "gallery-masonry": 9,
  "gallery-grid": 6,
  "gallery-carousel": 5,
};

export function getMinimumImages(preset: string): number {
  return GALLERY_IMAGE_MINIMUMS[preset] ?? 1;
}

export function getPreset(id: string): SectionPreset | undefined {
  return allPresets[id];
}

export function getImageRequirements(presetId: string): ImageRequirements | undefined {
  return getPreset(presetId)?.imageRequirements;
}

/** Get maximum image requirements across all presets for a section type */
export function getMaxImageRequirements(sectionType: SectionType): ImageRequirements | undefined {
  const presets = getPresetsForType(sectionType);
  const requirements = presets
    .map(p => p.imageRequirements)
    .filter((r): r is ImageRequirements => r !== undefined);
  if (requirements.length === 0) return undefined;

  // Find requirement with highest count
  return requirements.reduce((max, r) => r.count > max.count ? r : max);
}

export function getPresetsForType(sectionType: SectionType): SectionPreset[] {
  return Object.values(allPresets).filter(p => p.sectionType === sectionType);
}

export function getDefaultPreset(sectionType: SectionType): string {
  return DEFAULT_PRESETS[sectionType];
}

export function getAllPresets(): SectionPreset[] {
  return Object.values(allPresets);
}

export function getPresetIds(): string[] {
  return Object.keys(allPresets);
}

export function isPresetId(id: string): boolean {
  return id in allPresets;
}

export { generateSectionPrompt } from "./ai";
