export type PaletteCategory = "warm" | "cool" | "nature" | "vibrant" | "neutral" | "luxury";
export type PaletteMood = "energetic" | "calm" | "professional" | "playful" | "luxurious" | "natural" | "edgy";
export type PaletteTemperature = "warm" | "cool" | "neutral";
export type PaletteContrast = "light" | "dark";

export interface PaletteColors {
  primary: string
  primaryHover: string
  accent: string
  background: string
  backgroundAlt: string
  text: string
  textMuted: string
  heroGradient?: string
  ctaBackground?: string
  ctaText?: string
}

export interface ColorPalette {
  id: string
  name: string

  category: PaletteCategory
  mood: PaletteMood
  temperature: PaletteTemperature
  contrast: PaletteContrast

  tags: string[]
  industries: string[]
  description: string

  colors: PaletteColors
}
