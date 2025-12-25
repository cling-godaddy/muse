export { heroPresets, type HeroPresetId } from "./hero";
export { featuresPresets, type FeaturesPresetId } from "./features";
export { testimonialsPresets, type TestimonialsPresetId } from "./testimonials";
export { galleryPresets, type GalleryPresetId } from "./gallery";
export { pricingPresets, type PricingPresetId } from "./pricing";
export { faqPresets, type FaqPresetId } from "./faq";
export { contactPresets, type ContactPresetId } from "./contact";
export { ctaPresets, type CtaPresetId } from "./cta";

import { heroPresets } from "./hero";
import { featuresPresets } from "./features";
import { testimonialsPresets } from "./testimonials";
import { galleryPresets } from "./gallery";
import { pricingPresets } from "./pricing";
import { faqPresets } from "./faq";
import { contactPresets } from "./contact";
import { ctaPresets } from "./cta";
import type { SectionPreset } from "../types";

export const allPresets: Record<string, SectionPreset> = {
  ...heroPresets,
  ...featuresPresets,
  ...testimonialsPresets,
  ...galleryPresets,
  ...pricingPresets,
  ...faqPresets,
  ...contactPresets,
  ...ctaPresets,
};
