import type { SectionPreset } from "../types";

export const featuresGrid: SectionPreset = {
  id: "features-grid",
  name: "Grid",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "professional",
  tags: ["clean", "scannable", "minimal", "organized"],
  industries: ["saas", "technology", "corporate", "consulting"],
  description: "Icon/image grid. Clean, scannable.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-features--grid",
};

export const featuresNumbered: SectionPreset = {
  id: "features-numbered",
  name: "Numbered",
  sectionType: "features",
  layoutPattern: "list",
  category: "value",
  mood: "professional",
  tags: ["process", "sequential", "clear", "instructional"],
  industries: ["saas", "consulting", "education", "service"],
  description: "Numbered steps. How-it-works, processes.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-features--numbered",
};

export const featuresPresets = {
  "features-grid": featuresGrid,
  "features-numbered": featuresNumbered,
} as const;

export type FeaturesPresetId = keyof typeof featuresPresets;
