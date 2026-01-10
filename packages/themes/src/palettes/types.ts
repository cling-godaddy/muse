export type PaletteCategory = "warm" | "cool" | "nature" | "vibrant" | "neutral" | "luxury";
export type PaletteMood = "energetic" | "calm" | "professional" | "playful" | "luxurious" | "natural" | "edgy";
export type PaletteTemperature = "warm" | "cool" | "neutral";
export type PaletteContrast = "light" | "dark";

/**
 * Color Token Architecture:
 *
 * Tier 1 - Core Palette: primary, background, text, etc.
 * Tier 2 - Semantic Tokens: onPrimary (text on primary backgrounds)
 * Tier 3 - Component Tokens: heroText, ctaText (specific overrides)
 *
 * Add semantic tokens (onAccent, surface/onSurface) as components need them.
 * Follow Material Design 3 naming: on{Surface} = text color for that surface.
 */
export interface PaletteColors {
  primary: string
  primaryHover: string
  accent: string
  background: string
  backgroundAlt: string
  text: string
  textMuted: string
  onPrimary?: string
  heroGradient?: string
  heroText?: string
  heroTextMuted?: string
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

  defaultStyle?: string
}
