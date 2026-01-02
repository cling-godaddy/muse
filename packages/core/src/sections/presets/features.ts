import type { SectionPreset } from "../types";

export const featuresGrid: SectionPreset = {
  id: "features-grid",
  name: "Cards",
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
  name: "Cards with Images",
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
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const featuresBento: SectionPreset = {
  id: "features-bento",
  name: "Bento Hero",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "modern",
  tags: ["visual", "dynamic", "showcase", "premium", "hero"],
  industries: ["saas", "fintech", "health", "creative"],
  description: "Hero card with supporting features. Modern, visual.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-features--bento",
  imageRequirements: { category: "subject", count: 6, orientation: "mixed" },
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const featuresBentoSpotlight: SectionPreset = {
  id: "features-bento-spotlight",
  name: "Bento Spotlight",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "modern",
  tags: ["visual", "spotlight", "centered", "premium"],
  industries: ["saas", "creative", "portfolio", "branding"],
  description: "Center spotlight surrounded by offset outer cards. 7-8 items.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-features--bento-spotlight",
  imageRequirements: { category: "subject", count: 8, orientation: "mixed", min: 7, max: 8 },
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const featuresBentoSplit: SectionPreset = {
  id: "features-bento-split",
  name: "Bento Split",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "modern",
  tags: ["visual", "comparison", "balanced", "minimal"],
  industries: ["saas", "ecommerce", "portfolio", "creative"],
  description: "Alternating wide and narrow cards. Clean pairs.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-features--bento-split",
  imageRequirements: { category: "subject", count: 4, orientation: "mixed", max: 8 },
  imageInjection: { type: "nested", array: "items", field: "image" },
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
  "features-bento-spotlight": featuresBentoSpotlight,
  "features-bento-split": featuresBentoSplit,
  "features-numbered": featuresNumbered,
} as const;

export type FeaturesPresetId = keyof typeof featuresPresets;
