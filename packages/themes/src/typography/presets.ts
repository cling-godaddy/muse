import type { TypographyPreset } from "./types";

// ============================================================================
// MODERN - clean geometric sans-serifs
// ============================================================================

export const inter: TypographyPreset = {
  id: "inter",
  name: "Inter",
  category: "modern",
  mood: "professional",
  tags: ["versatile", "clean", "tech", "readable", "neutral"],
  description: "Geometric sans-serif, highly versatile for any context",
  fonts: {
    heading: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Inter:wght@400;500;600;700"],
};

export const geist: TypographyPreset = {
  id: "geist",
  name: "Geist",
  category: "modern",
  mood: "minimal",
  tags: ["sharp", "technical", "modern", "developer", "precise"],
  description: "Sharp technical aesthetic, ideal for dev tools and SaaS",
  fonts: {
    heading: "Geist, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Geist, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 600, body: 400 },
  googleFonts: ["Geist:wght@400;500;600"],
};

export const plusJakarta: TypographyPreset = {
  id: "plus-jakarta",
  name: "Plus Jakarta",
  category: "modern",
  mood: "approachable",
  tags: ["friendly", "geometric", "modern", "startup", "warm"],
  description: "Friendly geometric sans with slight warmth",
  fonts: {
    heading: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Plus+Jakarta+Sans:wght@400;500;600;700"],
};

// ============================================================================
// CLASSIC - serif headlines with trusted feel
// ============================================================================

export const georgia: TypographyPreset = {
  id: "georgia",
  name: "Georgia",
  category: "classic",
  mood: "professional",
  tags: ["traditional", "trustworthy", "editorial", "readable", "timeless"],
  description: "Traditional serif headlines, trustworthy and established",
  fonts: {
    heading: "Georgia, Times New Roman, serif",
    body: "-apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 600, body: 400 },
};

export const playfair: TypographyPreset = {
  id: "playfair",
  name: "Playfair Display",
  category: "classic",
  mood: "elegant",
  tags: ["elegant", "sophisticated", "luxury", "editorial", "refined"],
  description: "Elegant display serif for luxury and editorial contexts",
  fonts: {
    heading: "Playfair Display, Georgia, serif",
    body: "Lato, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Playfair+Display:wght@400;500;600;700", "Lato:wght@400;700"],
};

export const merriweather: TypographyPreset = {
  id: "merriweather",
  name: "Merriweather",
  category: "classic",
  mood: "professional",
  tags: ["readable", "warm", "editorial", "content", "literary"],
  description: "Highly readable serif, great for content-heavy sites",
  fonts: {
    heading: "Merriweather, Georgia, serif",
    body: "Open Sans, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Merriweather:wght@400;700", "Open+Sans:wght@400;600"],
};

// ============================================================================
// FRIENDLY - rounded, approachable fonts
// ============================================================================

export const nunito: TypographyPreset = {
  id: "nunito",
  name: "Nunito",
  category: "friendly",
  mood: "approachable",
  tags: ["rounded", "warm", "friendly", "casual", "soft"],
  description: "Rounded sans-serif, warm and approachable",
  fonts: {
    heading: "Nunito, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Nunito, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 800, body: 400 },
  googleFonts: ["Nunito:wght@400;600;700;800"],
};

export const quicksand: TypographyPreset = {
  id: "quicksand",
  name: "Quicksand",
  category: "friendly",
  mood: "approachable",
  tags: ["light", "airy", "modern", "friendly", "geometric"],
  description: "Light and airy geometric rounded sans",
  fonts: {
    heading: "Quicksand, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Quicksand, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Quicksand:wght@400;500;600;700"],
};

export const poppins: TypographyPreset = {
  id: "poppins",
  name: "Poppins",
  category: "friendly",
  mood: "approachable",
  tags: ["geometric", "modern", "versatile", "clean", "friendly"],
  description: "Geometric sans that's both modern and approachable",
  fonts: {
    heading: "Poppins, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Poppins, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 600, body: 400 },
  googleFonts: ["Poppins:wght@400;500;600;700"],
};

// ============================================================================
// EXPRESSIVE - display fonts with personality
// ============================================================================

export const clash: TypographyPreset = {
  id: "clash",
  name: "Clash Display",
  category: "expressive",
  mood: "bold",
  tags: ["impact", "bold", "display", "creative", "striking"],
  description: "Bold display font for maximum visual impact",
  fonts: {
    heading: "Clash Display, Impact, sans-serif",
    body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Inter:wght@400;500;600"],
};

export const spaceGrotesk: TypographyPreset = {
  id: "space-grotesk",
  name: "Space Grotesk",
  category: "expressive",
  mood: "creative",
  tags: ["quirky", "tech", "memorable", "unique", "retro-future"],
  description: "Quirky proportional sans with memorable character",
  fonts: {
    heading: "Space Grotesk, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Space Grotesk, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Space+Grotesk:wght@400;500;600;700"],
};

export const cabinet: TypographyPreset = {
  id: "cabinet",
  name: "Cabinet Grotesk",
  category: "expressive",
  mood: "creative",
  tags: ["editorial", "modern", "sophisticated", "agency", "bold"],
  description: "Modern editorial grotesk with agency aesthetic",
  fonts: {
    heading: "Cabinet Grotesk, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Satoshi, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  weights: { heading: 700, body: 400 },
};

// ============================================================================
// ALL PRESETS
// ============================================================================

export const typographyPresets = {
  // modern
  inter,
  geist,
  "plus-jakarta": plusJakarta,
  // classic
  georgia,
  playfair,
  merriweather,
  // friendly
  nunito,
  quicksand,
  poppins,
  // expressive
  clash,
  "space-grotesk": spaceGrotesk,
  cabinet,
} as const;

export type TypographyId = keyof typeof typographyPresets;
