import type { SectionPreset } from "../types";

export const pricingCards: SectionPreset = {
  id: "pricing-cards",
  name: "Cards",
  sectionType: "pricing",
  layoutPattern: "cards",
  category: "conversion",
  mood: "professional",
  tags: ["standard", "comparison", "clear", "actionable"],
  industries: ["saas", "technology", "service", "subscription"],
  description: "Side-by-side plan cards. Standard.",
  requiredFields: ["plans"],
  optionalFields: ["headline", "subheadline", "billingToggle"],
  className: "muse-pricing--cards",
};

export const pricingTable: SectionPreset = {
  id: "pricing-table",
  name: "Comparison Table",
  sectionType: "pricing",
  layoutPattern: "table",
  category: "conversion",
  mood: "professional",
  tags: ["detailed", "feature-rich", "comprehensive", "analytical"],
  industries: ["enterprise", "saas", "technology", "b2b"],
  description: "Feature comparison table.",
  requiredFields: ["plans", "features"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-pricing--table",
};

export const pricingSimple: SectionPreset = {
  id: "pricing-simple",
  name: "Simple",
  sectionType: "pricing",
  layoutPattern: "centered",
  category: "conversion",
  mood: "minimal",
  tags: ["focused", "single-plan", "clear", "direct"],
  industries: ["freelance", "consulting", "single-product", "service"],
  description: "Single plan highlight.",
  requiredFields: ["plans"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-pricing--simple",
};

export const pricingPresets = {
  "pricing-cards": pricingCards,
  "pricing-table": pricingTable,
  "pricing-simple": pricingSimple,
} as const;

export type PricingPresetId = keyof typeof pricingPresets;
