import type { SectionPreset } from "../types";

export const menuList: SectionPreset = {
  id: "menu-list",
  name: "List",
  sectionType: "menu",
  layoutPattern: "list",
  category: "content",
  mood: "classic",
  tags: ["traditional", "elegant", "readable", "organized"],
  industries: ["restaurant", "cafe", "bar", "catering"],
  description: "Classic text menu. Prices right-aligned. Categories as headers.",
  requiredFields: ["categories"],
  optionalFields: ["headline", "subheadline", "items"],
  className: "muse-menu--list",
};

export const menuCards: SectionPreset = {
  id: "menu-cards",
  name: "Cards",
  sectionType: "menu",
  layoutPattern: "cards",
  category: "content",
  mood: "modern",
  tags: ["visual", "modern", "appetizing", "showcase"],
  industries: ["bakery", "cafe", "dessert", "bistro"],
  description: "Cards with images. Modern cafe/bakery style.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline", "categories"],
  className: "muse-menu--cards",
  imageRequirements: { category: "subject", count: 6, orientation: "square" },
};

export const menuSimple: SectionPreset = {
  id: "menu-simple",
  name: "Simple",
  sectionType: "menu",
  layoutPattern: "list",
  category: "content",
  mood: "minimal",
  tags: ["dense", "compact", "clean", "quick"],
  industries: ["bar", "cafe", "takeout", "deli"],
  description: "Minimal. Name + price only. Dense columns.",
  requiredFields: ["items"],
  optionalFields: ["headline", "categories"],
  className: "muse-menu--simple",
};

export const menuPresets = {
  "menu-list": menuList,
  "menu-cards": menuCards,
  "menu-simple": menuSimple,
} as const;

export type MenuPresetId = keyof typeof menuPresets;
