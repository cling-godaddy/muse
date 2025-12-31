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

export const ctaPresets = {
  "cta-centered": ctaCentered,
} as const;

export type CtaPresetId = keyof typeof ctaPresets;
