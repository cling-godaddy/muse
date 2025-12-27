import type { ColorPalette } from "./types";

// ============================================================================
// WARM PALETTES
// ============================================================================

export const sunset: ColorPalette = {
  id: "sunset",
  name: "Sunset",
  category: "warm",
  mood: "energetic",
  temperature: "warm",
  contrast: "light",
  tags: ["vibrant", "warm", "inviting", "energetic", "optimistic"],
  industries: ["hospitality", "food", "travel", "entertainment", "events"],
  description: "Orange and coral gradient with energetic warmth",
  colors: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    accent: "#fb923c",
    background: "#fffbeb",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
    ctaBackground: "#f97316",
  },
};

export const terracotta: ColorPalette = {
  id: "terracotta",
  name: "Terracotta",
  category: "warm",
  mood: "natural",
  temperature: "warm",
  contrast: "light",
  tags: ["earthy", "artisan", "handmade", "organic", "rustic"],
  industries: ["crafts", "pottery", "home", "interior", "artisan"],
  description: "Earthy red-brown tones with artisan feel",
  colors: {
    primary: "#c2410c",
    primaryHover: "#9a3412",
    accent: "#ea580c",
    background: "#fef2f2",
    backgroundAlt: "#fee2e2",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
    ctaBackground: "#c2410c",
  },
};

export const coral: ColorPalette = {
  id: "coral",
  name: "Coral",
  category: "warm",
  mood: "playful",
  temperature: "warm",
  contrast: "light",
  tags: ["soft", "approachable", "feminine", "fresh", "modern"],
  industries: ["beauty", "fashion", "lifestyle", "wellness", "social"],
  description: "Soft pink-orange tones, approachable and modern",
  colors: {
    primary: "#fb7185",
    primaryHover: "#f43f5e",
    accent: "#fda4af",
    background: "#fff1f2",
    backgroundAlt: "#ffe4e6",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #fb7185 0%, #fda4af 100%)",
    ctaBackground: "#fb7185",
  },
};

export const amber: ColorPalette = {
  id: "amber",
  name: "Amber",
  category: "warm",
  mood: "luxurious",
  temperature: "warm",
  contrast: "light",
  tags: ["golden", "premium", "warm", "rich", "inviting"],
  industries: ["food", "beverage", "hospitality", "luxury", "spirits"],
  description: "Golden honey tones with premium warmth",
  colors: {
    primary: "#d97706",
    primaryHover: "#b45309",
    accent: "#fbbf24",
    background: "#fffbeb",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
    ctaBackground: "#d97706",
  },
};

export const rose: ColorPalette = {
  id: "rose",
  name: "Rose",
  category: "warm",
  mood: "calm",
  temperature: "warm",
  contrast: "light",
  tags: ["elegant", "feminine", "soft", "romantic", "refined"],
  industries: ["beauty", "wedding", "fashion", "luxury", "wellness"],
  description: "Dusty pink tones with feminine elegance",
  colors: {
    primary: "#e11d48",
    primaryHover: "#be123c",
    accent: "#f43f5e",
    background: "#fff1f2",
    backgroundAlt: "#ffe4e6",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
    ctaBackground: "#e11d48",
  },
};

// ============================================================================
// COOL PALETTES
// ============================================================================

export const ocean: ColorPalette = {
  id: "ocean",
  name: "Ocean",
  category: "cool",
  mood: "calm",
  temperature: "cool",
  contrast: "light",
  tags: ["trust", "depth", "calm", "professional", "reliable"],
  industries: ["finance", "healthcare", "insurance", "consulting", "corporate"],
  description: "Teal and blue depth, trust and calm",
  colors: {
    primary: "#0891b2",
    primaryHover: "#0e7490",
    accent: "#22d3ee",
    background: "#ecfeff",
    backgroundAlt: "#cffafe",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    ctaBackground: "#0891b2",
  },
};

export const arctic: ColorPalette = {
  id: "arctic",
  name: "Arctic",
  category: "cool",
  mood: "calm",
  temperature: "cool",
  contrast: "light",
  tags: ["clean", "fresh", "minimal", "crisp", "pure"],
  industries: ["healthcare", "technology", "dental", "medical", "clean-tech"],
  description: "Icy light blue, clean and fresh",
  colors: {
    primary: "#0ea5e9",
    primaryHover: "#0284c7",
    accent: "#38bdf8",
    background: "#f0f9ff",
    backgroundAlt: "#e0f2fe",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 100%)",
    ctaBackground: "#0ea5e9",
  },
};

export const slate: ColorPalette = {
  id: "slate",
  name: "Slate",
  category: "cool",
  mood: "professional",
  temperature: "cool",
  contrast: "light",
  tags: ["corporate", "trust", "professional", "reliable", "established"],
  industries: ["legal", "finance", "consulting", "enterprise", "b2b"],
  description: "Blue-gray professional tones, corporate trust",
  colors: {
    primary: "#1e40af",
    primaryHover: "#1e3a8a",
    accent: "#3b82f6",
    background: "#ffffff",
    backgroundAlt: "#f1f5f9",
    text: "#1e293b",
    textMuted: "#475569",
    heroGradient: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
    ctaBackground: "#1e40af",
  },
};

export const indigo: ColorPalette = {
  id: "indigo",
  name: "Indigo",
  category: "cool",
  mood: "professional",
  temperature: "cool",
  contrast: "light",
  tags: ["tech", "innovation", "modern", "digital", "startup"],
  industries: ["technology", "software", "saas", "fintech", "ai"],
  description: "Deep purple-blue, innovation and tech",
  colors: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    accent: "#8b5cf6",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    ctaBackground: "#6366f1",
  },
};

export const mint: ColorPalette = {
  id: "mint",
  name: "Mint",
  category: "cool",
  mood: "calm",
  temperature: "cool",
  contrast: "light",
  tags: ["fresh", "health", "clean", "natural", "soothing"],
  industries: ["healthcare", "wellness", "dental", "pharmacy", "fitness"],
  description: "Fresh green-blue, health and vitality",
  colors: {
    primary: "#14b8a6",
    primaryHover: "#0d9488",
    accent: "#2dd4bf",
    background: "#f0fdfa",
    backgroundAlt: "#ccfbf1",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)",
    ctaBackground: "#14b8a6",
  },
};

// ============================================================================
// NATURE PALETTES
// ============================================================================

export const forest: ColorPalette = {
  id: "forest",
  name: "Forest",
  category: "nature",
  mood: "natural",
  temperature: "cool",
  contrast: "light",
  tags: ["organic", "sustainable", "eco", "growth", "natural"],
  industries: ["eco", "organic", "outdoor", "environmental", "agriculture"],
  description: "Deep green tones, sustainable and organic",
  colors: {
    primary: "#166534",
    primaryHover: "#14532d",
    accent: "#22c55e",
    background: "#f0fdf4",
    backgroundAlt: "#dcfce7",
    text: "#14532d",
    textMuted: "#4d7c0f",
    heroGradient: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    ctaBackground: "#166534",
  },
};

export const sage: ColorPalette = {
  id: "sage",
  name: "Sage",
  category: "nature",
  mood: "calm",
  temperature: "neutral",
  contrast: "light",
  tags: ["calm", "sophisticated", "muted", "wellness", "serene"],
  industries: ["wellness", "spa", "yoga", "meditation", "interior"],
  description: "Muted green, sophisticated calm",
  colors: {
    primary: "#65a30d",
    primaryHover: "#4d7c0f",
    accent: "#84cc16",
    background: "#fefce8",
    backgroundAlt: "#ecfccb",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #65a30d 0%, #84cc16 100%)",
    ctaBackground: "#65a30d",
  },
};

export const earth: ColorPalette = {
  id: "earth",
  name: "Earth",
  category: "nature",
  mood: "natural",
  temperature: "warm",
  contrast: "light",
  tags: ["grounded", "authentic", "natural", "rustic", "warm"],
  industries: ["outdoor", "camping", "furniture", "coffee", "artisan"],
  description: "Warm brown tones, grounded and authentic",
  colors: {
    primary: "#78350f",
    primaryHover: "#451a03",
    accent: "#a16207",
    background: "#fffbeb",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #78350f 0%, #a16207 100%)",
    ctaBackground: "#78350f",
  },
};

export const moss: ColorPalette = {
  id: "moss",
  name: "Moss",
  category: "nature",
  mood: "calm",
  temperature: "neutral",
  contrast: "light",
  tags: ["organic", "natural", "earthy", "calm", "understated"],
  industries: ["eco", "organic", "garden", "landscape", "natural"],
  description: "Olive green tones, organic and understated",
  colors: {
    primary: "#4d7c0f",
    primaryHover: "#3f6212",
    accent: "#65a30d",
    background: "#fefce8",
    backgroundAlt: "#ecfccb",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #4d7c0f 0%, #65a30d 100%)",
    ctaBackground: "#4d7c0f",
  },
};

// ============================================================================
// NEUTRAL PALETTES
// ============================================================================

export const mono: ColorPalette = {
  id: "mono",
  name: "Mono",
  category: "neutral",
  mood: "professional",
  temperature: "neutral",
  contrast: "light",
  tags: ["minimal", "clean", "bold", "contrast", "modern"],
  industries: ["design", "architecture", "photography", "fashion", "agency"],
  description: "Pure black and white, maximum contrast",
  colors: {
    primary: "#0f172a",
    primaryHover: "#1e293b",
    accent: "#64748b",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "none",
    ctaBackground: "#0f172a",
  },
};

export const stone: ColorPalette = {
  id: "stone",
  name: "Stone",
  category: "neutral",
  mood: "calm",
  temperature: "warm",
  contrast: "light",
  tags: ["understated", "warm", "elegant", "sophisticated", "timeless"],
  industries: ["architecture", "interior", "luxury", "real-estate", "consulting"],
  description: "Warm gray tones, understated elegance",
  colors: {
    primary: "#57534e",
    primaryHover: "#44403c",
    accent: "#78716c",
    background: "#fafaf9",
    backgroundAlt: "#f5f5f4",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(180deg, #57534e 0%, #44403c 100%)",
    ctaBackground: "#57534e",
  },
};

export const graphite: ColorPalette = {
  id: "graphite",
  name: "Graphite",
  category: "neutral",
  mood: "professional",
  temperature: "cool",
  contrast: "light",
  tags: ["modern", "sleek", "professional", "tech", "minimal"],
  industries: ["technology", "automotive", "industrial", "b2b", "enterprise"],
  description: "Cool gray tones, modern and sleek",
  colors: {
    primary: "#475569",
    primaryHover: "#334155",
    accent: "#64748b",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(180deg, #475569 0%, #334155 100%)",
    ctaBackground: "#475569",
  },
};

export const paper: ColorPalette = {
  id: "paper",
  name: "Paper",
  category: "neutral",
  mood: "calm",
  temperature: "warm",
  contrast: "light",
  tags: ["editorial", "elegant", "refined", "literary", "classic"],
  industries: ["publishing", "editorial", "literary", "education", "culture"],
  description: "Cream and ivory tones, editorial elegance",
  colors: {
    primary: "#1c1917",
    primaryHover: "#0c0a09",
    accent: "#78716c",
    background: "#fefce8",
    backgroundAlt: "#fef9c3",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "none",
    ctaBackground: "#1c1917",
  },
};

// ============================================================================
// VIBRANT PALETTES
// ============================================================================

export const electric: ColorPalette = {
  id: "electric",
  name: "Electric",
  category: "vibrant",
  mood: "energetic",
  temperature: "cool",
  contrast: "dark",
  tags: ["bold", "neon", "energetic", "dynamic", "youth"],
  industries: ["gaming", "esports", "entertainment", "nightlife", "music"],
  description: "Neon accents on dark, high energy",
  colors: {
    primary: "#a855f7",
    primaryHover: "#9333ea",
    accent: "#22d3ee",
    background: "#0f172a",
    backgroundAlt: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    heroGradient: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
    ctaBackground: "#a855f7",
  },
};

export const aurora: ColorPalette = {
  id: "aurora",
  name: "Aurora",
  category: "vibrant",
  mood: "playful",
  temperature: "cool",
  contrast: "light",
  tags: ["gradient", "colorful", "playful", "creative", "dynamic"],
  industries: ["creative", "design", "art", "events", "marketing"],
  description: "Rainbow gradient, playful and dynamic",
  colors: {
    primary: "#ec4899",
    primaryHover: "#db2777",
    accent: "#8b5cf6",
    background: "#fefce8",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#57534e",
    heroGradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)",
    ctaBackground: "#ec4899",
  },
};

export const candy: ColorPalette = {
  id: "candy",
  name: "Candy",
  category: "vibrant",
  mood: "playful",
  temperature: "warm",
  contrast: "light",
  tags: ["fun", "bright", "youthful", "sweet", "cheerful"],
  industries: ["kids", "toys", "candy", "entertainment", "social"],
  description: "Bright pastels, fun and cheerful",
  colors: {
    primary: "#f472b6",
    primaryHover: "#ec4899",
    accent: "#c084fc",
    background: "#fdf4ff",
    backgroundAlt: "#fae8ff",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",
    ctaBackground: "#f472b6",
  },
};

// ============================================================================
// LUXURY PALETTES
// ============================================================================

export const noir: ColorPalette = {
  id: "noir",
  name: "Noir",
  category: "luxury",
  mood: "luxurious",
  temperature: "neutral",
  contrast: "dark",
  tags: ["sophisticated", "premium", "elegant", "exclusive", "high-end"],
  industries: ["fashion", "jewelry", "luxury", "automotive", "watches"],
  description: "Black with gold accents, sophisticated luxury",
  colors: {
    primary: "#fbbf24",
    primaryHover: "#f59e0b",
    accent: "#d97706",
    background: "#0a0a0a",
    backgroundAlt: "#171717",
    text: "#fafafa",
    textMuted: "#a3a3a3",
    heroGradient: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
    ctaBackground: "#fbbf24",
  },
};

export const champagne: ColorPalette = {
  id: "champagne",
  name: "Champagne",
  category: "luxury",
  mood: "luxurious",
  temperature: "warm",
  contrast: "light",
  tags: ["elegant", "refined", "celebration", "premium", "sophisticated"],
  industries: ["wedding", "luxury", "hospitality", "events", "jewelry"],
  description: "Gold and cream tones, elegant celebration",
  colors: {
    primary: "#b45309",
    primaryHover: "#92400e",
    accent: "#fbbf24",
    background: "#fffbeb",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #b45309 0%, #fbbf24 100%)",
    ctaBackground: "#b45309",
  },
};

export const bordeaux: ColorPalette = {
  id: "bordeaux",
  name: "Bordeaux",
  category: "luxury",
  mood: "luxurious",
  temperature: "warm",
  contrast: "light",
  tags: ["wine", "refined", "rich", "sophisticated", "classic"],
  industries: ["wine", "fine-dining", "luxury", "fashion", "hospitality"],
  description: "Deep wine tones, refined sophistication",
  colors: {
    primary: "#881337",
    primaryHover: "#701a3a",
    accent: "#be123c",
    background: "#fff1f2",
    backgroundAlt: "#ffe4e6",
    text: "#1c1917",
    textMuted: "#78716c",
    heroGradient: "linear-gradient(135deg, #881337 0%, #be123c 100%)",
    ctaBackground: "#881337",
  },
};

// ============================================================================
// TECHNICAL
// ============================================================================

export const terminalPalette: ColorPalette = {
  id: "terminal",
  name: "Terminal",
  category: "neutral",
  mood: "edgy",
  temperature: "neutral",
  contrast: "dark",
  tags: ["hacker", "developer", "technical", "monochrome", "retro"],
  industries: ["developer-tools", "security", "crypto", "gaming", "tech"],
  description: "Green phosphor on black, classic terminal aesthetic",
  colors: {
    primary: "#00ff00",
    primaryHover: "#00cc00",
    accent: "#00ff00",
    background: "#0a0a0a",
    backgroundAlt: "#0f0f0f",
    text: "#00ff00",
    textMuted: "#00aa00",
    heroGradient: "#0a0a0a",
    ctaBackground: "#00ff00",
    ctaText: "#0a0a0a",
  },
  defaultStyle: "sharp",
};

// ============================================================================
// ALL PALETTES
// ============================================================================

export const palettes = {
  // warm
  sunset,
  terracotta,
  coral,
  amber,
  rose,
  // cool
  ocean,
  arctic,
  slate,
  indigo,
  mint,
  // nature
  forest,
  sage,
  earth,
  moss,
  // neutral
  mono,
  stone,
  graphite,
  paper,
  // vibrant
  electric,
  aurora,
  candy,
  // luxury
  noir,
  champagne,
  bordeaux,
  // technical
  terminal: terminalPalette,
} as const;

export type PaletteId = keyof typeof palettes;
