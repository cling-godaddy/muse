import type { SectionPreset } from "../types";

export const footerSimple: SectionPreset = {
  id: "footer-simple",
  name: "Simple",
  sectionType: "footer",
  layoutPattern: "centered",
  category: "structural",
  mood: "minimal",
  tags: ["clean", "simple", "compact", "minimal"],
  industries: ["startup", "saas", "portfolio", "blog"],
  description: "Centered footer with copyright and social links.",
  requiredFields: [],
  optionalFields: ["companyName", "copyright", "links", "socialLinks"],
  className: "muse-footer--simple",
  defaultBackground: "backgroundAlt",
};

export const footerPresets = {
  "footer-simple": footerSimple,
} as const;

export type FooterPresetId = keyof typeof footerPresets;
