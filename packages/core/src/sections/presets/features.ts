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

export const featuresGridImages: SectionPreset = {
  id: "features-grid-images",
  name: "Grid with Images",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "visual",
  tags: ["visual", "cards", "showcase", "modern"],
  industries: ["saas", "ecommerce", "portfolio", "creative"],
  description: "Feature cards with images instead of icons.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-features--grid-images",
  imageRequirements: { category: "subject", count: 6, orientation: "horizontal" },
};

export const featuresBento: SectionPreset = {
  id: "features-bento",
  name: "Bento",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "modern",
  tags: ["visual", "dynamic", "showcase", "premium"],
  industries: ["saas", "fintech", "health", "creative"],
  description: "Asymmetric grid with varied card sizes. Modern, visual.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-features--bento",
  imageRequirements: { category: "subject", count: 6, orientation: "mixed" },
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
  "features-grid-images": featuresGridImages,
  "features-bento": featuresBento,
  "features-numbered": featuresNumbered,
} as const;

export type FeaturesPresetId = keyof typeof featuresPresets;
