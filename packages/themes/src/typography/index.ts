export * from "./types";
export * from "./presets";

import type { TypographyPreset, TypographyCategory } from "./types";
import { typographyPresets, type TypographyId } from "./presets";

export const DEFAULT_TYPOGRAPHY_ID: TypographyId = "inter";

export function getTypography(id: string): TypographyPreset | undefined {
  return typographyPresets[id as TypographyId];
}

export function getAllTypography(): TypographyPreset[] {
  return Object.values(typographyPresets);
}

export function getTypographyByCategory(category: TypographyCategory): TypographyPreset[] {
  return Object.values(typographyPresets).filter(t => t.category === category);
}

export function getTypographyIds(): TypographyId[] {
  return Object.keys(typographyPresets) as TypographyId[];
}

export function isTypographyId(id: string): id is TypographyId {
  return id in typographyPresets;
}

export const typographyCategories: TypographyCategory[] = [
  "modern",
  "classic",
  "friendly",
  "expressive",
];

export const typographyCategoryDescriptions: Record<TypographyCategory, string> = {
  modern: "Clean geometric sans-serifs for tech and startups",
  classic: "Serif headlines with trusted, editorial feel",
  friendly: "Rounded approachable fonts for lifestyle brands",
  expressive: "Display fonts with bold personality",
};
