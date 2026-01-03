export { heroPresets, type HeroPresetId } from "./hero";
export { featuresPresets, type FeaturesPresetId } from "./features";
export { testimonialsPresets, type TestimonialsPresetId } from "./testimonials";
export { galleryPresets, type GalleryPresetId } from "./gallery";
export { pricingPresets, type PricingPresetId } from "./pricing";
export { faqPresets, type FaqPresetId } from "./faq";
export { contactPresets, type ContactPresetId } from "./contact";
export { ctaPresets, type CtaPresetId } from "./cta";
export { footerPresets, type FooterPresetId } from "./footer";
export { aboutPresets, type AboutPresetId } from "./about";
export { subscribePresets, type SubscribePresetId } from "./subscribe";
export { statsPresets, type StatsPresetId } from "./stats";
export { logosPresets, type LogosPresetId } from "./logos";
export { menuPresets, type MenuPresetId } from "./menu";
export { productsPresets, type ProductsPresetId } from "./products";
export { navbarPresets, type NavbarPresetId } from "./navbar";

import { heroPresets } from "./hero";
import { featuresPresets } from "./features";
import { testimonialsPresets } from "./testimonials";
import { galleryPresets } from "./gallery";
import { pricingPresets } from "./pricing";
import { faqPresets } from "./faq";
import { contactPresets } from "./contact";
import { ctaPresets } from "./cta";
import { footerPresets } from "./footer";
import { aboutPresets } from "./about";
import { subscribePresets } from "./subscribe";
import { statsPresets } from "./stats";
import { logosPresets } from "./logos";
import { menuPresets } from "./menu";
import { productsPresets } from "./products";
import { navbarPresets } from "./navbar";
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
  ...footerPresets,
  ...aboutPresets,
  ...subscribePresets,
  ...statsPresets,
  ...logosPresets,
  ...menuPresets,
  ...productsPresets,
  ...navbarPresets,
};
