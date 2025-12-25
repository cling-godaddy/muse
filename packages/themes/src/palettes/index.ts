export * from "./types";
export * from "./presets";

import type { ColorPalette, PaletteCategory } from "./types";
import { palettes, type PaletteId } from "./presets";

export const DEFAULT_PALETTE_ID: PaletteId = "slate";

export function getPalette(id: string): ColorPalette | undefined {
  return palettes[id as PaletteId];
}

export function getAllPalettes(): ColorPalette[] {
  return Object.values(palettes);
}

export function getPalettesByCategory(category: PaletteCategory): ColorPalette[] {
  return Object.values(palettes).filter(p => p.category === category);
}

export function getPaletteIds(): PaletteId[] {
  return Object.keys(palettes) as PaletteId[];
}

export function isPaletteId(id: string): id is PaletteId {
  return id in palettes;
}

export const paletteCategories: PaletteCategory[] = [
  "warm",
  "cool",
  "nature",
  "neutral",
  "vibrant",
  "luxury",
];

export const paletteCategoryDescriptions: Record<PaletteCategory, string> = {
  warm: "Food, hospitality, lifestyle",
  cool: "Tech, finance, healthcare",
  nature: "Eco, wellness, outdoor",
  neutral: "Minimal, portfolio, luxury",
  vibrant: "Creative, gaming, youth",
  luxury: "Fashion, jewelry, premium",
};
