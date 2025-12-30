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
};

export const footerColumns: SectionPreset = {
  id: "footer-columns",
  name: "Columns",
  sectionType: "footer",
  layoutPattern: "grid",
  category: "structural",
  mood: "professional",
  tags: ["organized", "comprehensive", "navigation", "corporate"],
  industries: ["corporate", "ecommerce", "saas", "agency"],
  description: "Multi-column footer with link groups.",
  requiredFields: ["links"],
  optionalFields: ["companyName", "copyright", "socialLinks"],
  className: "muse-footer--columns",
};

export const footerMinimal: SectionPreset = {
  id: "footer-minimal",
  name: "Minimal",
  sectionType: "footer",
  layoutPattern: "banner",
  category: "structural",
  mood: "minimal",
  tags: ["minimal", "subtle", "compact"],
  industries: ["portfolio", "creative", "personal", "blog"],
  description: "Single line with copyright only.",
  requiredFields: [],
  optionalFields: ["copyright"],
  className: "muse-footer--minimal",
};

export const footerPresets = {
  "footer-simple": footerSimple,
  "footer-columns": footerColumns,
  "footer-minimal": footerMinimal,
} as const;

export type FooterPresetId = keyof typeof footerPresets;
