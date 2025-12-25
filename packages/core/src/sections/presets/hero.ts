import type { SectionPreset } from "../types";

export const heroCentered: SectionPreset = {
  id: "hero-centered",
  name: "Centered",
  sectionType: "hero",
  layoutPattern: "centered",
  category: "structural",
  mood: "professional",
  tags: ["classic", "balanced", "symmetrical", "versatile"],
  industries: ["corporate", "saas", "finance", "consulting"],
  description: "Centered headline with CTA below. Default, versatile.",
  requiredFields: ["headline"],
  optionalFields: ["subheadline", "cta", "secondaryCta", "backgroundImage"],
  className: "muse-hero--centered",
};

export const heroSplitLeft: SectionPreset = {
  id: "hero-split-left",
  name: "Split Left",
  sectionType: "hero",
  layoutPattern: "split",
  category: "structural",
  mood: "modern",
  tags: ["dynamic", "asymmetrical", "image-focused", "engaging"],
  industries: ["technology", "startup", "product", "ecommerce"],
  description: "Text left, image right. Product showcases.",
  requiredFields: ["headline", "backgroundImage"],
  optionalFields: ["subheadline", "cta", "secondaryCta"],
  className: "muse-hero--split-left",
};

export const heroSplitRight: SectionPreset = {
  id: "hero-split-right",
  name: "Split Right",
  sectionType: "hero",
  layoutPattern: "split",
  category: "structural",
  mood: "modern",
  tags: ["dynamic", "asymmetrical", "image-focused"],
  industries: ["technology", "startup", "product", "ecommerce"],
  description: "Image left, text right.",
  requiredFields: ["headline", "backgroundImage"],
  optionalFields: ["subheadline", "cta", "secondaryCta"],
  className: "muse-hero--split-right",
};

export const heroOverlay: SectionPreset = {
  id: "hero-overlay",
  name: "Overlay",
  sectionType: "hero",
  layoutPattern: "overlay",
  category: "structural",
  mood: "elegant",
  tags: ["immersive", "dramatic", "full-bleed", "visual"],
  industries: ["travel", "hospitality", "photography", "luxury"],
  description: "Full-bleed image with text overlay. Immersive.",
  requiredFields: ["headline", "backgroundImage"],
  optionalFields: ["subheadline", "cta", "secondaryCta", "backgroundOverlay"],
  className: "muse-hero--overlay",
};

export const heroPresets = {
  "hero-centered": heroCentered,
  "hero-split-left": heroSplitLeft,
  "hero-split-right": heroSplitRight,
  "hero-overlay": heroOverlay,
} as const;

export type HeroPresetId = keyof typeof heroPresets;
