// Section data types
export type {
  SectionBase,
  Section,
  HeroSection,
  FeaturesSection,
  CtaSection,
  TestimonialsSection,
  GallerySection,
  PricingSection,
  FaqSection,
  ContactSection,
  FooterSection,
  AboutSection,
  SubscribeSection,
  StatsSection,
  LogosSection,
  MenuSection,
  ProductsSection,
  ImageSource,
  FeatureItem,
  Quote,
  PricingPlan,
  FaqItem,
  FormField,
  FooterLink,
  SocialPlatform,
  SocialLink,
  TeamMember,
  StatItem,
  LogoItem,
  MenuItem,
  MenuCategory,
  ProductItem,
} from "./types";

export {
  isSectionType,
  isHeroSection,
  isFeaturesSection,
  isCtaSection,
  isTestimonialsSection,
  isGallerySection,
  isPricingSection,
  isFaqSection,
  isContactSection,
  isFooterSection,
  isAboutSection,
  isSubscribeSection,
  isStatsSection,
  isLogosSection,
  isMenuSection,
  isProductsSection,
} from "./types";

// Preset types
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
  footerPresets,
  aboutPresets,
  subscribePresets,
  statsPresets,
  logosPresets,
  menuPresets,
  productsPresets,
  allPresets,
  type HeroPresetId,
  type FeaturesPresetId,
  type TestimonialsPresetId,
  type GalleryPresetId,
  type PricingPresetId,
  type FaqPresetId,
  type ContactPresetId,
  type CtaPresetId,
  type FooterPresetId,
  type AboutPresetId,
  type SubscribePresetId,
  type StatsPresetId,
  type LogosPresetId,
  type MenuPresetId,
  type ProductsPresetId,
} from "./presets";

import type { SectionPreset, SectionType, ImageRequirements } from "./types";
import { allPresets } from "./presets";

export const DEFAULT_PRESETS: Record<SectionType, string> = {
  hero: "hero-centered",
  features: "features-grid",
  testimonials: "testimonials-carousel",
  gallery: "gallery-grid",
  pricing: "pricing-cards",
  faq: "faq-accordion",
  contact: "contact-form",
  cta: "cta-centered",
  footer: "footer-simple",
  about: "about-story",
  subscribe: "subscribe-card",
  stats: "stats-row",
  logos: "logos-grid",
  menu: "menu-list",
  products: "products-grid",
};

export const GALLERY_IMAGE_MINIMUMS: Record<string, number> = {
  "gallery-masonry": 10,
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

// AI
export {
  generateSectionPrompt,
  generateSectionSchemaPrompt,
  SECTION_TYPES,
  type AISectionSchema,
  registerAISectionSchema,
  getAISectionSchema,
  getAllAISectionSchemas,
} from "./ai";

// Schemas
export {
  imageSourceSchema,
  heroSectionSchema,
  featuresSectionSchema,
  ctaSectionSchema,
  testimonialsSectionSchema,
  gallerySectionSchema,
  pricingSectionSchema,
  faqSectionSchema,
  contactSectionSchema,
  footerSectionSchema,
  aboutSectionSchema,
  subscribeSectionSchema,
  statsSectionSchema,
  logosSectionSchema,
  sectionSchema,
  validateSection,
  validateSections,
} from "./schemas";

// Metadata
export {
  type SectionMeta,
  registerSectionMeta,
  getSectionMeta,
  getAllSectionMeta,
} from "./metadata";

// Factory
export { createSection } from "./factory";
