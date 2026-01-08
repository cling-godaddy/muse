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
  defaultBackground: "background",
  imageRequirements: { category: "subject", count: 6, orientation: "horizontal" },
  imageInjection: { type: "array", field: "images" },
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
  defaultBackground: "background",
  imageRequirements: { category: "subject", count: 10, orientation: "mixed" },
  imageInjection: { type: "array", field: "images" },
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
  defaultBackground: "background",
  imageRequirements: { category: "subject", count: 5, orientation: "horizontal" },
  imageInjection: { type: "array", field: "images" },
};

export const galleryPresets = {
  "gallery-grid": galleryGrid,
  "gallery-masonry": galleryMasonry,
  "gallery-carousel": galleryCarousel,
} as const;

export type GalleryPresetId = keyof typeof galleryPresets;
