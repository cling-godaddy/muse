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

export const terminal: TypographyPreset = {
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

export const bubblegum: TypographyPreset = {
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

export const synthwave: TypographyPreset = {
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
// FIGMA PAIRINGS (source: figma.com/resource-library/font-pairings)
// ============================================================================

export const abrilFatface: TypographyPreset = {
  id: "abril-fatface",
  name: "Abril Fatface + Lato",
  category: "classic",
  mood: "elegant",
  tags: ["luxury", "editorial", "sophisticated", "display", "impactful"],
  description: "Bold elegant serifs for headlines with clean sans serif body",
  fonts: {
    heading: "Abril Fatface, Georgia, serif",
    body: "Lato, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Abril+Fatface", "Lato:wght@400;700"],
};

export const fugazOne: TypographyPreset = {
  id: "fugaz-one",
  name: "Fugaz One + Work Sans",
  category: "expressive",
  mood: "creative",
  tags: ["energetic", "geometric", "italic", "marketing", "bold"],
  description: "Geometric italic headlines with clean body text",
  fonts: {
    heading: "Fugaz One, system-ui, sans-serif",
    body: "Work Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Fugaz+One", "Work+Sans:wght@400;500;600"],
};

export const spaceMono: TypographyPreset = {
  id: "space-mono",
  name: "Space Mono + Plus Jakarta Sans",
  category: "modern",
  mood: "professional",
  tags: ["tech", "coding", "monospace", "retro", "innovation"],
  description: "Retro-tech monospace headlines with friendly body text",
  fonts: {
    heading: "Space Mono, monospace",
    body: "Plus Jakarta Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Space+Mono:wght@400;700", "Plus+Jakarta+Sans:wght@400;500;600"],
};

export const grandHotel: TypographyPreset = {
  id: "grand-hotel",
  name: "Grand Hotel + Lato",
  category: "classic",
  mood: "elegant",
  tags: ["script", "wedding", "boutique", "elegant", "romantic"],
  description: "Elegant script headlines with clean body text",
  fonts: {
    heading: "Grand Hotel, cursive",
    body: "Lato, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Grand+Hotel", "Lato:wght@400;700"],
};

export const raleway: TypographyPreset = {
  id: "raleway",
  name: "Raleway + Merriweather",
  category: "classic",
  mood: "professional",
  tags: ["educational", "corporate", "neo-grotesque", "readable", "literary"],
  description: "Sleek sans headlines with classic serif body",
  fonts: {
    heading: "Raleway, system-ui, sans-serif",
    body: "Merriweather, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Raleway:wght@500;600;700", "Merriweather:wght@400;700"],
};

export const chonburi: TypographyPreset = {
  id: "chonburi",
  name: "Chonburi + Domine",
  category: "expressive",
  mood: "bold",
  tags: ["retro", "playful", "news", "publications", "authority"],
  description: "Playful retro headlines with approachable serif body",
  fonts: {
    heading: "Chonburi, system-ui, sans-serif",
    body: "Domine, Georgia, serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Chonburi", "Domine:wght@400;700"],
};

export const interKrub: TypographyPreset = {
  id: "inter-krub",
  name: "Inter + Krub",
  category: "modern",
  mood: "approachable",
  tags: ["tech", "digital", "looped", "innovative", "friendly"],
  description: "Clean modern headlines with distinctive looped body text",
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Krub, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Inter:wght@500;600;700", "Krub:wght@400;500;600"],
};

export const oswald: TypographyPreset = {
  id: "oswald",
  name: "Oswald + Source Serif 4",
  category: "modern",
  mood: "professional",
  tags: ["condensed", "bold", "responsive", "readable", "trustworthy"],
  description: "Bold condensed headlines with refined serif body",
  fonts: {
    heading: "Oswald, system-ui, sans-serif",
    body: "Source Serif 4, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Oswald:wght@500;600;700", "Source+Serif+4:wght@400;600"],
};

export const arimaMadurai: TypographyPreset = {
  id: "arima-madurai",
  name: "Arima Madurai + Mulish",
  category: "friendly",
  mood: "creative",
  tags: ["flowing", "warm", "children", "creative", "playful"],
  description: "Flowing curved headlines with polished body text",
  fonts: {
    heading: "Arima, system-ui, sans-serif",
    body: "Mulish, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Arima:wght@400;500;600;700", "Mulish:wght@400;500;600"],
};

export const nunitoLora: TypographyPreset = {
  id: "nunito-lora",
  name: "Nunito + Lora",
  category: "friendly",
  mood: "approachable",
  tags: ["rounded", "warm", "educational", "healthcare", "inviting"],
  description: "Rounded friendly headlines with elegant serif body",
  fonts: {
    heading: "Nunito, system-ui, sans-serif",
    body: "Lora, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Nunito:wght@600;700;800", "Lora:wght@400;500;600"],
};

export const ultra: TypographyPreset = {
  id: "ultra",
  name: "Ultra + Slabo 27px",
  category: "expressive",
  mood: "bold",
  tags: ["bold", "slab", "editorial", "music", "impactful"],
  description: "Bold slab headlines with screen-optimized body",
  fonts: {
    heading: "Ultra, Georgia, serif",
    body: "Slabo 27px, Georgia, serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Ultra", "Slabo+27px"],
};

export const arvo: TypographyPreset = {
  id: "arvo",
  name: "Arvo + Lato",
  category: "modern",
  mood: "professional",
  tags: ["geometric", "slab", "technical", "corporate", "confident"],
  description: "Sturdy geometric slab headlines with clean body",
  fonts: {
    heading: "Arvo, Georgia, serif",
    body: "Lato, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Arvo:wght@400;700", "Lato:wght@400;700"],
};

export const unicaOne: TypographyPreset = {
  id: "unica-one",
  name: "Unica One + Crimson Text",
  category: "classic",
  mood: "elegant",
  tags: ["condensed", "luxury", "magazine", "sophisticated", "timeless"],
  description: "Bold condensed headlines with classic serif body",
  fonts: {
    heading: "Unica One, system-ui, sans-serif",
    body: "Crimson Text, Georgia, serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Unica+One", "Crimson+Text:wght@400;600;700"],
};

export const cinzel: TypographyPreset = {
  id: "cinzel",
  name: "Cinzel + Fauna One",
  category: "classic",
  mood: "elegant",
  tags: ["roman", "heritage", "history", "art", "refined"],
  description: "Roman-inspired headlines with soft serif body",
  fonts: {
    heading: "Cinzel, Georgia, serif",
    body: "Fauna One, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Cinzel:wght@400;500;600;700", "Fauna+One"],
};

export const yesevaOne: TypographyPreset = {
  id: "yeseva-one",
  name: "Yeseva One + Josefin Sans",
  category: "expressive",
  mood: "creative",
  tags: ["feminine", "fashion", "lifestyle", "elegant", "modern"],
  description: "Bold feminine headlines with geometric body",
  fonts: {
    heading: "Yeseva One, Georgia, serif",
    body: "Josefin Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Yeseva+One", "Josefin+Sans:wght@400;500;600"],
};

export const sacramento: TypographyPreset = {
  id: "sacramento",
  name: "Sacramento + Alice",
  category: "classic",
  mood: "elegant",
  tags: ["script", "wedding", "romantic", "vintage", "nostalgic"],
  description: "Flowing script headlines with whimsical serif body",
  fonts: {
    heading: "Sacramento, cursive",
    body: "Alice, Georgia, serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Sacramento", "Alice"],
};

export const robotoLora: TypographyPreset = {
  id: "roboto-lora",
  name: "Roboto + Lora",
  category: "modern",
  mood: "professional",
  tags: ["versatile", "blog", "editorial", "readable", "balanced"],
  description: "Modern sans headlines with elegant serif body",
  fonts: {
    heading: "Roboto, system-ui, sans-serif",
    body: "Lora, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Roboto:wght@400;500;700", "Lora:wght@400;500;600"],
};

export const montserratKarla: TypographyPreset = {
  id: "montserrat-karla",
  name: "Montserrat + Karla",
  category: "modern",
  mood: "professional",
  tags: ["geometric", "corporate", "tech", "polished", "urban"],
  description: "Geometric headlines with humanist body text",
  fonts: {
    heading: "Montserrat, system-ui, sans-serif",
    body: "Karla, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Montserrat:wght@500;600;700", "Karla:wght@400;500;600"],
};

export const fjallaOne: TypographyPreset = {
  id: "fjalla-one",
  name: "Fjalla One + Cantarell",
  category: "modern",
  mood: "bold",
  tags: ["tall", "condensed", "confident", "marketing", "bold"],
  description: "Tall bold headlines with friendly humanist body",
  fonts: {
    heading: "Fjalla One, system-ui, sans-serif",
    body: "Cantarell, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Fjalla+One", "Cantarell:wght@400;700"],
};

export const sourceSansPro: TypographyPreset = {
  id: "source-sans-pro",
  name: "Source Sans Pro + Alegreya",
  category: "classic",
  mood: "professional",
  tags: ["literary", "publication", "educational", "readable", "warm"],
  description: "Clean professional headlines with calligraphic body",
  fonts: {
    heading: "Source Sans 3, system-ui, sans-serif",
    body: "Alegreya, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Source+Sans+3:wght@400;600;700", "Alegreya:wght@400;500;600"],
};

export const stintUltraExpanded: TypographyPreset = {
  id: "stint-ultra-expanded",
  name: "Stint Ultra Expanded + Pontano Sans",
  category: "expressive",
  mood: "bold",
  tags: ["wide", "expanded", "impactful", "unique", "display"],
  description: "Wide expanded headlines with sleek geometric body",
  fonts: {
    heading: "Stint Ultra Expanded, system-ui, sans-serif",
    body: "Pontano Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Stint+Ultra+Expanded", "Pontano+Sans"],
};

export const ubuntuRokkitt: TypographyPreset = {
  id: "ubuntu-rokkitt",
  name: "Ubuntu + Rokkitt",
  category: "modern",
  mood: "professional",
  tags: ["tech", "digital", "friendly", "humanist", "sturdy"],
  description: "Friendly modern headlines with sturdy slab body",
  fonts: {
    heading: "Ubuntu, system-ui, sans-serif",
    body: "Rokkitt, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Ubuntu:wght@400;500;700", "Rokkitt:wght@400;500;600"],
};

export const nunitoPtSans: TypographyPreset = {
  id: "nunito-pt-sans",
  name: "Nunito + PT Sans",
  category: "friendly",
  mood: "approachable",
  tags: ["rounded", "soft", "professional", "friendly", "accessible"],
  description: "Soft rounded headlines with structured body text",
  fonts: {
    heading: "Nunito, system-ui, sans-serif",
    body: "PT Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Nunito:wght@600;700;800", "PT+Sans:wght@400;700"],
};

export const dotGothic16: TypographyPreset = {
  id: "dot-gothic-16",
  name: "DotGothic16 + Space Mono",
  category: "expressive",
  mood: "creative",
  tags: ["pixel", "retro", "gaming", "tech", "nostalgic"],
  description: "Pixel-art headlines with monospace body text",
  fonts: {
    heading: "DotGothic16, system-ui, sans-serif",
    body: "Space Mono, monospace",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["DotGothic16", "Space+Mono:wght@400;700"],
};

export const syne: TypographyPreset = {
  id: "syne",
  name: "Syne + Inter",
  category: "expressive",
  mood: "creative",
  tags: ["bold", "expanding", "design", "innovative", "fresh"],
  description: "Bold expanding headlines with clean body text",
  fonts: {
    heading: "Syne, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Syne:wght@400;500;600;700;800", "Inter:wght@400;500;600"],
};

export const yellowtail: TypographyPreset = {
  id: "yellowtail",
  name: "Yellowtail + Rethink Sans",
  category: "expressive",
  mood: "creative",
  tags: ["script", "retro", "restaurant", "casual", "playful"],
  description: "Retro brush script headlines with modern body text",
  fonts: {
    heading: "Yellowtail, cursive",
    body: "Rethink Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Yellowtail", "Rethink+Sans:wght@400;500;600"],
};

export const rufina: TypographyPreset = {
  id: "rufina",
  name: "Rufina + Average Sans",
  category: "classic",
  mood: "elegant",
  tags: ["classic", "editorial", "refined", "timeless", "simple"],
  description: "Classic serif headlines with neutral body text",
  fonts: {
    heading: "Rufina, Georgia, serif",
    body: "Average Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Rufina:wght@400;700", "Average+Sans"],
};

export const poiretOne: TypographyPreset = {
  id: "poiret-one",
  name: "Poiret One + Montserrat",
  category: "expressive",
  mood: "elegant",
  tags: ["art-deco", "luxury", "geometric", "stylish", "display"],
  description: "Art Deco geometric headlines with urban body text",
  fonts: {
    heading: "Poiret One, system-ui, sans-serif",
    body: "Montserrat, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Poiret+One", "Montserrat:wght@400;500;600"],
};

export const sintony: TypographyPreset = {
  id: "sintony",
  name: "Sintony + Poppins",
  category: "modern",
  mood: "professional",
  tags: ["square", "tech", "sophisticated", "friendly", "clean"],
  description: "Sophisticated square headlines with geometric body",
  fonts: {
    heading: "Sintony, system-ui, sans-serif",
    body: "Poppins, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Sintony:wght@400;700", "Poppins:wght@400;500;600"],
};

export const philosopher: TypographyPreset = {
  id: "philosopher",
  name: "Philosopher + Mulish",
  category: "classic",
  mood: "elegant",
  tags: ["literary", "educational", "elegant", "timeless", "versatile"],
  description: "Elegant modern serif headlines with minimalist body",
  fonts: {
    heading: "Philosopher, Georgia, serif",
    body: "Mulish, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Philosopher:wght@400;700", "Mulish:wght@400;500;600"],
};

export const cardo: TypographyPreset = {
  id: "cardo",
  name: "Cardo + Hind",
  category: "classic",
  mood: "professional",
  tags: ["scholarly", "historical", "educational", "literary", "traditional"],
  description: "Scholarly serif headlines with clean Devanagari-based body",
  fonts: {
    heading: "Cardo, Georgia, serif",
    body: "Hind, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Cardo:wght@400;700", "Hind:wght@400;500;600"],
};

export const bubblegumSans: TypographyPreset = {
  id: "bubblegum-sans",
  name: "Bubblegum Sans + Open Sans",
  category: "friendly",
  mood: "approachable",
  tags: ["playful", "children", "fun", "casual", "rounded"],
  description: "Playful rounded headlines with neutral body text",
  fonts: {
    heading: "Bubblegum Sans, system-ui, sans-serif",
    body: "Open Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Bubblegum+Sans", "Open+Sans:wght@400;500;600"],
};

export const archivoNarrow: TypographyPreset = {
  id: "archivo-narrow",
  name: "Archivo Narrow + Tenor Sans",
  category: "modern",
  mood: "professional",
  tags: ["condensed", "corporate", "editorial", "efficient", "elegant"],
  description: "Condensed headlines with elegant sans body",
  fonts: {
    heading: "Archivo Narrow, system-ui, sans-serif",
    body: "Tenor Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Archivo+Narrow:wght@400;500;600;700", "Tenor+Sans"],
};

export const rethinkSans: TypographyPreset = {
  id: "rethink-sans",
  name: "Rethink Sans + Spectral",
  category: "modern",
  mood: "professional",
  tags: ["crisp", "corporate", "editorial", "contemporary", "readable"],
  description: "Crisp modern headlines with warm serif body",
  fonts: {
    heading: "Rethink Sans, system-ui, sans-serif",
    body: "Spectral, Georgia, serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Rethink+Sans:wght@400;500;600;700", "Spectral:wght@400;500;600"],
};

export const crimsonText: TypographyPreset = {
  id: "crimson-text",
  name: "Crimson Text + DM Sans",
  category: "classic",
  mood: "professional",
  tags: ["traditional", "credible", "publication", "authoritative", "balanced"],
  description: "Traditional serif headlines with geometric body",
  fonts: {
    heading: "Crimson Text, Georgia, serif",
    body: "DM Sans, system-ui, sans-serif",
  },
  weights: { heading: 700, body: 400 },
  googleFonts: ["Crimson+Text:wght@400;600;700", "DM+Sans:wght@400;500;600"],
};

export const youngSerif: TypographyPreset = {
  id: "young-serif",
  name: "Young Serif + Instrument Sans",
  category: "expressive",
  mood: "creative",
  tags: ["display", "art", "portfolio", "character", "artistic"],
  description: "Characterful serif headlines with clean body text",
  fonts: {
    heading: "Young Serif, Georgia, serif",
    body: "Instrument Sans, system-ui, sans-serif",
  },
  weights: { heading: 400, body: 400 },
  googleFonts: ["Young+Serif", "Instrument+Sans:wght@400;500;600"],
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
  terminal,
  // retro-futuristic
  synthwave,
  // bubblegum
  bubblegum,
  // figma pairings
  "abril-fatface": abrilFatface,
  "fugaz-one": fugazOne,
  "space-mono": spaceMono,
  "grand-hotel": grandHotel,
  raleway,
  chonburi,
  "inter-krub": interKrub,
  oswald,
  "arima-madurai": arimaMadurai,
  "nunito-lora": nunitoLora,
  ultra,
  arvo,
  "unica-one": unicaOne,
  cinzel,
  "yeseva-one": yesevaOne,
  sacramento,
  "roboto-lora": robotoLora,
  "montserrat-karla": montserratKarla,
  "fjalla-one": fjallaOne,
  "source-sans-pro": sourceSansPro,
  "stint-ultra-expanded": stintUltraExpanded,
  "ubuntu-rokkitt": ubuntuRokkitt,
  "nunito-pt-sans": nunitoPtSans,
  "dot-gothic-16": dotGothic16,
  syne,
  yellowtail,
  rufina,
  "poiret-one": poiretOne,
  sintony,
  philosopher,
  cardo,
  "bubblegum-sans": bubblegumSans,
  "archivo-narrow": archivoNarrow,
  "rethink-sans": rethinkSans,
  "crimson-text": crimsonText,
  "young-serif": youngSerif,
} as const;

export type TypographyId = keyof typeof typographyPresets;
