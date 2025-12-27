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
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Inter:wght@400;500;600;700"],
};

export const outfit: TypographyPreset = {
  id: "outfit",
  name: "Outfit + Inter",
  category: "modern",
  mood: "professional",
  tags: ["modern", "display", "geometric", "startup", "clean"],
  description: "Modern geometric display paired with versatile Inter",
  fonts: {
    heading: "Outfit, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  weights: { heading: 600, body: 400 },
  googleFonts: ["Outfit:wght@500;600;700", "Inter:wght@400;500;600"],
};

export const plusJakarta: TypographyPreset = {
  id: "plus-jakarta",
  name: "Plus Jakarta + DM Sans",
  category: "modern",
  mood: "approachable",
  tags: ["friendly", "geometric", "modern", "startup", "warm"],
  description: "Friendly geometric headlines with readable DM Sans body",
  fonts: {
    heading: "Plus Jakarta Sans, system-ui, sans-serif",
    body: "DM Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Plus+Jakarta+Sans:wght@500;600;700", "DM+Sans:wght@400;500;600"],
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
  description: "Traditional serif headlines with system sans body",
  fonts: {
    heading: "Georgia, Times New Roman, serif",
    body: "system-ui, -apple-system, sans-serif",
  },
  weights: { heading: 700, body: 400 },
};

export const playfair: TypographyPreset = {
  id: "playfair",
  name: "Playfair + Lato",
  category: "classic",
  mood: "elegant",
  tags: ["elegant", "sophisticated", "luxury", "editorial", "refined"],
  description: "Elegant display serif paired with clean Lato body",
  fonts: {
    heading: "Playfair Display, Georgia, serif",
    body: "Lato, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Playfair+Display:wght@400;500;600;700", "Lato:wght@400;700"],
};

export const merriweather: TypographyPreset = {
  id: "merriweather",
  name: "Merriweather + Source Sans",
  category: "classic",
  mood: "professional",
  tags: ["readable", "warm", "editorial", "content", "literary"],
  description: "Warm readable serif with clean Source Sans body",
  fonts: {
    heading: "Merriweather, Georgia, serif",
    body: "Source Sans 3, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Merriweather:wght@400;700", "Source+Sans+3:wght@400;600"],
};

// ============================================================================
// FRIENDLY - rounded, approachable fonts
// ============================================================================

export const nunito: TypographyPreset = {
  id: "nunito",
  name: "Nunito + Mulish",
  category: "friendly",
  mood: "approachable",
  tags: ["rounded", "warm", "friendly", "casual", "soft"],
  description: "Rounded bold headlines with readable Mulish body",
  fonts: {
    heading: "Nunito, system-ui, sans-serif",
    body: "Mulish, system-ui, sans-serif",
  },
  weights: { heading: 800, body: 400 },
  googleFonts: ["Nunito:wght@600;700;800", "Mulish:wght@400;500;600"],
};

export const quicksand: TypographyPreset = {
  id: "quicksand",
  name: "Quicksand + Lato",
  category: "friendly",
  mood: "approachable",
  tags: ["light", "airy", "modern", "friendly", "geometric"],
  description: "Light airy headlines grounded by versatile Lato",
  fonts: {
    heading: "Quicksand, system-ui, sans-serif",
    body: "Lato, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Quicksand:wght@500;600;700", "Lato:wght@400;700"],
};

export const poppins: TypographyPreset = {
  id: "poppins",
  name: "Poppins + DM Sans",
  category: "friendly",
  mood: "approachable",
  tags: ["geometric", "modern", "versatile", "clean", "friendly"],
  description: "Geometric Poppins headlines with readable DM Sans",
  fonts: {
    heading: "Poppins, system-ui, sans-serif",
    body: "DM Sans, system-ui, sans-serif",
  },
  weights: { heading: 600, body: 400 },
  googleFonts: ["Poppins:wght@500;600;700", "DM+Sans:wght@400;500"],
};

// ============================================================================
// EXPRESSIVE - display fonts with personality
// ============================================================================

export const spaceGrotesk: TypographyPreset = {
  id: "space-grotesk",
  name: "Space Grotesk + Work Sans",
  category: "expressive",
  mood: "creative",
  tags: ["quirky", "tech", "memorable", "unique", "retro-future"],
  description: "Quirky distinctive headlines with neutral Work Sans body",
  fonts: {
    heading: "Space Grotesk, system-ui, sans-serif",
    body: "Work Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Space+Grotesk:wght@500;600;700", "Work+Sans:wght@400;500;600"],
};

export const sora: TypographyPreset = {
  id: "sora",
  name: "Sora + Inter",
  category: "expressive",
  mood: "bold",
  tags: ["impact", "bold", "display", "creative", "striking"],
  description: "Bold distinctive Sora headlines with versatile Inter",
  fonts: {
    heading: "Sora, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Sora:wght@500;600;700;800", "Inter:wght@400;500;600"],
};

export const archivo: TypographyPreset = {
  id: "archivo",
  name: "Archivo Black + Archivo",
  category: "expressive",
  mood: "bold",
  tags: ["bold", "impactful", "editorial", "modern", "strong"],
  description: "Bold Archivo Black headlines with matching Archivo body",
  fonts: {
    heading: "Archivo Black, system-ui, sans-serif",
    body: "Archivo, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Archivo+Black", "Archivo:wght@400;500;600"],
};

// ============================================================================
// TECHNICAL - monospace fonts
// ============================================================================

export const terminalTypography: TypographyPreset = {
  id: "terminal",
  name: "JetBrains Mono",
  category: "expressive",
  mood: "creative",
  tags: ["monospace", "developer", "hacker", "technical", "code"],
  description: "Monospace font for terminal/hacker aesthetic",
  fonts: {
    heading: "\"JetBrains Mono\", \"Fira Code\", \"SF Mono\", monospace",
    body: "\"JetBrains Mono\", \"Fira Code\", \"SF Mono\", monospace",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["JetBrains+Mono:wght@400;500;700"],
};

// ============================================================================
// BUBBLEGUM
// ============================================================================

export const bubblegumTypography: TypographyPreset = {
  id: "bubblegum",
  name: "Quicksand + Nunito",
  category: "friendly",
  mood: "approachable",
  tags: ["rounded", "soft", "friendly", "bubbly", "geometric"],
  description: "Rounded bubbly fonts with a soft playful feel",
  fonts: {
    heading: "Quicksand, system-ui, sans-serif",
    body: "Nunito, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Quicksand:wght@400;500;600;700", "Nunito:wght@400;500;600"],
};

// ============================================================================
// RETRO-FUTURISTIC
// ============================================================================

export const synthwaveTypography: TypographyPreset = {
  id: "synthwave",
  name: "Orbitron + Inter",
  category: "expressive",
  mood: "bold",
  tags: ["retro", "futuristic", "sci-fi", "display", "geometric"],
  description: "Retro-futuristic display font with clean body text",
  fonts: {
    heading: "Orbitron, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Orbitron:wght@400;500;600;700;800;900", "Inter:wght@400;500;600"],
};

// ============================================================================
// ALL PRESETS
// ============================================================================

export const typographyPresets = {
  // modern
  inter,
  outfit,
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
  "space-grotesk": spaceGrotesk,
  sora,
  archivo,
  // technical
  "terminal": terminalTypography,
  // retro-futuristic
  "synthwave": synthwaveTypography,
  // bubblegum
  "bubblegum": bubblegumTypography,
} as const;

export type TypographyId = keyof typeof typographyPresets;
