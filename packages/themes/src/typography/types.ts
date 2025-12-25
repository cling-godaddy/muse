export type TypographyCategory = "modern" | "classic" | "friendly" | "expressive";
export type TypographyMood = "professional" | "approachable" | "elegant" | "bold" | "minimal" | "creative";

export interface TypographyPreset {
  id: string
  name: string

  category: TypographyCategory
  mood: TypographyMood

  tags: string[]
  description: string

  fonts: {
    heading: string
    body: string
    accent?: string
  }

  weights: {
    heading: number
    body: number
  }

  googleFonts?: string[]
}
