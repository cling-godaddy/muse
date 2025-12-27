import type { SectionPreset } from "../types";

export const galleryGrid: SectionPreset = {
  id: "gallery-grid",
  name: "Grid",
  sectionType: "gallery",
  layoutPattern: "grid",
  category: "showcase",
  mood: "professional",
  tags: ["uniform", "clean", "organized", "balanced"],
  industries: ["portfolio", "real-estate", "product", "corporate"],
  description: "Even grid. Clean, uniform.",
  requiredFields: ["images"],
  optionalFields: ["headline", "columns"],
  className: "muse-gallery--grid",
  imageRequirements: { category: "subject", count: 6, orientation: "horizontal" },
};

export const galleryMasonry: SectionPreset = {
  id: "gallery-masonry",
  name: "Masonry",
  sectionType: "gallery",
  layoutPattern: "masonry",
  category: "showcase",
  mood: "creative",
  tags: ["pinterest", "organic", "varied", "artistic"],
  industries: ["photography", "creative", "portfolio", "lifestyle"],
  description: "Pinterest-style. Mixed aspect ratios.",
  requiredFields: ["images"],
  optionalFields: ["headline"],
  className: "muse-gallery--masonry",
  imageRequirements: { category: "subject", count: 9, orientation: "mixed" },
};

export const galleryCarousel: SectionPreset = {
  id: "gallery-carousel",
  name: "Carousel",
  sectionType: "gallery",
  layoutPattern: "carousel",
  category: "showcase",
  mood: "modern",
  tags: ["focused", "interactive", "immersive", "storytelling"],
  industries: ["product", "travel", "hospitality", "real-estate"],
  description: "Sliding images. Focused viewing.",
  requiredFields: ["images"],
  optionalFields: ["headline"],
  className: "muse-gallery--carousel",
  imageRequirements: { category: "subject", count: 5, orientation: "horizontal" },
};

export const galleryPresets = {
  "gallery-grid": galleryGrid,
  "gallery-masonry": galleryMasonry,
  "gallery-carousel": galleryCarousel,
} as const;

export type GalleryPresetId = keyof typeof galleryPresets;
