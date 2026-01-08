import type { SectionPreset } from "../types";

export const logosGrid: SectionPreset = {
  id: "logos-grid",
  name: "Grid",
  sectionType: "logos",
  layoutPattern: "grid",
  category: "social-proof",
  mood: "professional",
  tags: ["static", "organized", "clean", "balanced"],
  industries: ["saas", "corporate", "consulting", "agency"],
  description: "Static grid of logos. Clean.",
  requiredFields: ["logos"],
  optionalFields: ["headline"],
  className: "muse-logos--grid",
  defaultBackground: "backgroundAlt",
};

export const logosMarquee: SectionPreset = {
  id: "logos-marquee",
  name: "Marquee",
  sectionType: "logos",
  layoutPattern: "carousel",
  category: "social-proof",
  mood: "modern",
  tags: ["animated", "scrolling", "dynamic", "continuous"],
  industries: ["startup", "technology", "agency", "marketing"],
  description: "Auto-scrolling logo marquee. Dynamic.",
  requiredFields: ["logos"],
  optionalFields: ["headline"],
  className: "muse-logos--marquee",
  defaultBackground: "backgroundAlt",
};

export const logosPresets = {
  "logos-grid": logosGrid,
  "logos-marquee": logosMarquee,
} as const;

export type LogosPresetId = keyof typeof logosPresets;
