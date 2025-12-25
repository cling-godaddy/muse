import type { SectionPreset } from "../types";

export const ctaCentered: SectionPreset = {
  id: "cta-centered",
  name: "Centered",
  sectionType: "cta",
  layoutPattern: "centered",
  category: "conversion",
  mood: "professional",
  tags: ["classic", "balanced", "versatile", "clear"],
  industries: ["saas", "corporate", "service", "consulting"],
  description: "Centered headline + button. Default.",
  requiredFields: ["headline", "buttonText"],
  optionalFields: ["description", "buttonHref", "secondaryButton"],
  className: "muse-cta--centered",
};

export const ctaBanner: SectionPreset = {
  id: "cta-banner",
  name: "Banner",
  sectionType: "cta",
  layoutPattern: "banner",
  category: "conversion",
  mood: "bold",
  tags: ["prominent", "full-width", "impactful", "strong"],
  industries: ["startup", "ecommerce", "product", "technology"],
  description: "Full-width colored band. Strong finish.",
  requiredFields: ["headline", "buttonText"],
  optionalFields: ["description", "buttonHref"],
  className: "muse-cta--banner",
};

export const ctaPresets = {
  "cta-centered": ctaCentered,
  "cta-banner": ctaBanner,
} as const;

export type CtaPresetId = keyof typeof ctaPresets;
