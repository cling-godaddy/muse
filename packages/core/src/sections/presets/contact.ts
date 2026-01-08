import type { SectionPreset } from "../types";

export const contactForm: SectionPreset = {
  id: "contact-form",
  name: "Centered Form",
  sectionType: "contact",
  layoutPattern: "centered",
  category: "conversion",
  mood: "professional",
  tags: ["simple", "focused", "clean", "direct"],
  industries: ["service", "consulting", "agency", "corporate"],
  description: "Centered form. Simple.",
  requiredFields: ["formFields"],
  optionalFields: ["headline", "subheadline", "email", "phone"],
  className: "muse-contact--form",
  defaultBackground: "background",
};

export const contactSplitMap: SectionPreset = {
  id: "contact-split-map",
  name: "Split with Map",
  sectionType: "contact",
  layoutPattern: "split",
  category: "conversion",
  mood: "professional",
  tags: ["local", "location", "visual", "informative"],
  industries: ["local-business", "retail", "hospitality", "real-estate"],
  description: "Form left, map right. Local businesses.",
  requiredFields: ["formFields", "address"],
  optionalFields: ["headline", "email", "phone", "hours"],
  className: "muse-contact--split-map",
  defaultBackground: "background",
};

export const contactPresets = {
  "contact-form": contactForm,
  "contact-split-map": contactSplitMap,
} as const;

export type ContactPresetId = keyof typeof contactPresets;
