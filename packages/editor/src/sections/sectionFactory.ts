import type { Section, SectionPreset, SectionType } from "@muse/core";
import { createSection } from "@muse/core";

export function createSectionFromPreset(preset: SectionPreset): Section {
  // minimal type-specific default data
  const defaults: Record<SectionType, Partial<Section>> = {
    navbar: { logo: { text: "" }, items: [], sticky: true },
    hero: { headline: "", subheadline: "", alignment: "center" },
    features: { headline: "", items: [] },
    testimonials: { headline: "", quotes: [] },
    gallery: { headline: "", images: [] },
    cta: { headline: "", description: "", buttonText: "", buttonHref: "#" },
    pricing: { headline: "", plans: [] },
    faq: { headline: "", items: [] },
    contact: { headline: "" },
    footer: { companyName: "", copyright: "", links: [], socialLinks: [] },
    about: { headline: "", body: "" },
    subscribe: { headline: "", buttonText: "", placeholderText: "" },
    stats: { headline: "", stats: [] },
    logos: { headline: "", logos: [] },
    menu: { headline: "", items: [] },
    products: { headline: "", items: [] },
  };

  const typeDefaults = defaults[preset.sectionType] || {};

  return createSection(preset.sectionType, {
    preset: preset.id,
    ...typeDefaults,
  });
}
