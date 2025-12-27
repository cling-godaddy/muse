import type { SectionPreset } from "../types";

export const featuresGridIcons: SectionPreset = {
  id: "features-grid-icons",
  name: "Icon Grid",
  sectionType: "features",
  layoutPattern: "grid",
  category: "value",
  mood: "professional",
  tags: ["clean", "scannable", "minimal", "organized"],
  industries: ["saas", "technology", "corporate", "consulting"],
  description: "3-col icon grid. Clean, scannable.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-features--grid-icons",
};

export const featuresGridCards: SectionPreset = {
  id: "features-grid-cards",
  name: "Card Grid",
  sectionType: "features",
  layoutPattern: "cards",
  category: "value",
  mood: "modern",
  tags: ["elevated", "visual", "prominent", "bold"],
  industries: ["startup", "product", "ecommerce", "technology"],
  description: "Elevated card layout. More visual weight.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-features--grid-cards",
};

export const featuresAlternating: SectionPreset = {
  id: "features-alternating",
  name: "Alternating",
  sectionType: "features",
  layoutPattern: "alternating",
  category: "value",
  mood: "creative",
  tags: ["storytelling", "narrative", "engaging", "visual"],
  industries: ["agency", "product", "lifestyle", "creative"],
  description: "Zigzag image/text rows. Storytelling.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-features--alternating",
  imageRequirements: { category: "subject", count: 5, orientation: "horizontal" },
};

export const featuresNumbered: SectionPreset = {
  id: "features-numbered",
  name: "Numbered Steps",
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
  "features-grid-icons": featuresGridIcons,
  "features-grid-cards": featuresGridCards,
  "features-alternating": featuresAlternating,
  "features-numbered": featuresNumbered,
} as const;

export type FeaturesPresetId = keyof typeof featuresPresets;
