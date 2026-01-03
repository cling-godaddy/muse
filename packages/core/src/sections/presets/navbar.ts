import type { SectionPreset } from "../types";

export const navbarMinimal: SectionPreset = {
  id: "navbar-minimal",
  name: "Minimal",
  sectionType: "navbar",
  layoutPattern: "banner",
  category: "structural",
  mood: "clean",
  tags: ["simple", "minimal", "flat", "compact"],
  industries: ["corporate", "saas", "portfolio", "blog"],
  description: "Logo and text links, no dropdowns. Clean and simple.",
  requiredFields: ["items"],
  optionalFields: ["logo", "cta", "sticky"],
  className: "muse-navbar--minimal",
};

export const navbarDropdown: SectionPreset = {
  id: "navbar-dropdown",
  name: "Dropdown",
  sectionType: "navbar",
  layoutPattern: "banner",
  category: "structural",
  mood: "professional",
  tags: ["navigation", "dropdown", "multi-level", "organized"],
  industries: ["agency", "enterprise", "ecommerce", "services"],
  description: "Logo with dropdown menus for nested pages. Standard navigation.",
  requiredFields: ["items"],
  optionalFields: ["logo", "cta", "sticky"],
  className: "muse-navbar--dropdown",
};

export const navbarTransparent: SectionPreset = {
  id: "navbar-transparent",
  name: "Transparent",
  sectionType: "navbar",
  layoutPattern: "overlay",
  category: "structural",
  mood: "elegant",
  tags: ["overlay", "transparent", "hero-integration", "immersive"],
  industries: ["travel", "hospitality", "photography", "luxury"],
  description: "Transparent navbar that overlays the hero section.",
  requiredFields: ["items"],
  optionalFields: ["logo", "cta", "sticky"],
  className: "muse-navbar--transparent",
};

export const navbarPresets = {
  "navbar-minimal": navbarMinimal,
  "navbar-dropdown": navbarDropdown,
  "navbar-transparent": navbarTransparent,
} as const;

export type NavbarPresetId = keyof typeof navbarPresets;
