import type { SectionType } from "./types";

export interface SectionMeta {
  type: SectionType
  label: string
  icon: string
  category: "content" | "layout" | "media" | "cta"
  description: string
}

const registry = new Map<SectionType, SectionMeta>();

export function registerSectionMeta(meta: SectionMeta): void {
  registry.set(meta.type, meta);
}

export function getSectionMeta(type: SectionType): SectionMeta | undefined {
  return registry.get(type);
}

export function getAllSectionMeta(): SectionMeta[] {
  return Array.from(registry.values());
}

registerSectionMeta({
  type: "hero",
  label: "Hero",
  icon: "layout",
  category: "layout",
  description: "Hero section with headline and CTA",
});

registerSectionMeta({
  type: "features",
  label: "Features",
  icon: "grid",
  category: "content",
  description: "Feature grid with icons",
});

registerSectionMeta({
  type: "cta",
  label: "Call to Action",
  icon: "mouse-pointer",
  category: "cta",
  description: "CTA section with button",
});

registerSectionMeta({
  type: "testimonials",
  label: "Testimonials",
  icon: "message-circle",
  category: "content",
  description: "Customer quotes and reviews",
});

registerSectionMeta({
  type: "gallery",
  label: "Gallery",
  icon: "images",
  category: "media",
  description: "Image gallery or portfolio",
});

registerSectionMeta({
  type: "pricing",
  label: "Pricing",
  icon: "credit-card",
  category: "cta",
  description: "Pricing plans and tiers",
});

registerSectionMeta({
  type: "faq",
  label: "FAQ",
  icon: "help-circle",
  category: "content",
  description: "Frequently asked questions",
});

registerSectionMeta({
  type: "contact",
  label: "Contact",
  icon: "mail",
  category: "cta",
  description: "Contact form and info",
});

registerSectionMeta({
  type: "footer",
  label: "Footer",
  icon: "layout-bottom",
  category: "layout",
  description: "Site footer with links and social",
});

registerSectionMeta({
  type: "about",
  label: "About",
  icon: "users",
  category: "content",
  description: "Company story and team",
});

registerSectionMeta({
  type: "subscribe",
  label: "Subscribe",
  icon: "mail-plus",
  category: "cta",
  description: "Newsletter signup form",
});

registerSectionMeta({
  type: "stats",
  label: "Stats",
  icon: "trending-up",
  category: "content",
  description: "Key numbers and metrics",
});

registerSectionMeta({
  type: "logos",
  label: "Logos",
  icon: "building",
  category: "content",
  description: "Client or partner logos",
});
