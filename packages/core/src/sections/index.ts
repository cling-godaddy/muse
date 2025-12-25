export type {
  SectionType,
  LayoutPattern,
  SectionCategory,
  SectionPreset,
  PresetId,
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

import type { SectionPreset, SectionType } from "./types";
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

export function getPreset(id: string): SectionPreset | undefined {
  return allPresets[id];
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
