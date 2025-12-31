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

export const pricingPresets = {
  "pricing-cards": pricingCards,
} as const;

export type PricingPresetId = keyof typeof pricingPresets;
