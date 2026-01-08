import type { SectionPreset } from "../types";

export const faqAccordion: SectionPreset = {
  id: "faq-accordion",
  name: "Accordion",
  sectionType: "faq",
  layoutPattern: "accordion",
  category: "content",
  mood: "professional",
  tags: ["expandable", "space-efficient", "interactive", "organized"],
  industries: ["saas", "ecommerce", "service", "support"],
  description: "Expandable questions. Space-efficient.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-faq--accordion",
  defaultBackground: "background",
};

export const faqTwoColumn: SectionPreset = {
  id: "faq-two-column",
  name: "Two Column",
  sectionType: "faq",
  layoutPattern: "grid",
  category: "content",
  mood: "professional",
  tags: ["scannable", "static", "visible", "balanced"],
  industries: ["corporate", "consulting", "education", "service"],
  description: "Q&A in two columns. Scannable.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-faq--two-column",
  defaultBackground: "background",
};

export const faqPresets = {
  "faq-accordion": faqAccordion,
  "faq-two-column": faqTwoColumn,
} as const;

export type FaqPresetId = keyof typeof faqPresets;
