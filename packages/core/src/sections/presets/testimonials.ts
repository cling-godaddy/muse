import type { SectionPreset } from "../types";

export const testimonialsCarousel: SectionPreset = {
  id: "testimonials-carousel",
  name: "Carousel",
  sectionType: "testimonials",
  layoutPattern: "carousel",
  category: "social-proof",
  mood: "professional",
  tags: ["dynamic", "interactive", "space-efficient", "many-quotes"],
  industries: ["saas", "agency", "consulting", "service"],
  description: "Sliding quotes. Many testimonials.",
  requiredFields: ["quotes"],
  optionalFields: ["headline"],
  className: "muse-testimonials--carousel",
};

export const testimonialsGrid: SectionPreset = {
  id: "testimonials-grid",
  name: "Grid",
  sectionType: "testimonials",
  layoutPattern: "grid",
  category: "social-proof",
  mood: "professional",
  tags: ["static", "scannable", "balanced", "organized"],
  industries: ["corporate", "saas", "consulting", "finance"],
  description: "2-3 quotes side by side.",
  requiredFields: ["quotes"],
  optionalFields: ["headline"],
  className: "muse-testimonials--grid",
  imageRequirements: { category: "people", count: 3, orientation: "square" },
  imageInjection: { type: "nested", array: "quotes", field: "avatar" },
};

export const testimonialsSingle: SectionPreset = {
  id: "testimonials-single",
  name: "Single Quote",
  sectionType: "testimonials",
  layoutPattern: "centered",
  category: "social-proof",
  mood: "elegant",
  tags: ["focused", "impactful", "dramatic", "minimal"],
  industries: ["luxury", "agency", "creative", "consulting"],
  description: "One large featured quote. High impact.",
  requiredFields: ["quotes"],
  optionalFields: ["headline"],
  className: "muse-testimonials--single",
};

export const testimonialsPresets = {
  "testimonials-carousel": testimonialsCarousel,
  "testimonials-grid": testimonialsGrid,
  "testimonials-single": testimonialsSingle,
} as const;

export type TestimonialsPresetId = keyof typeof testimonialsPresets;
