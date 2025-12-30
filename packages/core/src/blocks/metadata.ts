import type { BlockType } from "./types";

export interface BlockMeta {
  type: BlockType
  label: string
  icon: string
  category: "content" | "layout" | "media" | "cta"
  description: string
}

const registry = new Map<BlockType, BlockMeta>();

export function registerBlockMeta(meta: BlockMeta): void {
  registry.set(meta.type, meta);
}

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return registry.get(type);
}

export function getAllBlockMeta(): BlockMeta[] {
  return Array.from(registry.values());
}

registerBlockMeta({
  type: "text",
  label: "Text",
  icon: "type",
  category: "content",
  description: "Text content block",
});

registerBlockMeta({
  type: "hero",
  label: "Hero",
  icon: "layout",
  category: "layout",
  description: "Hero section with headline and CTA",
});

registerBlockMeta({
  type: "features",
  label: "Features",
  icon: "grid",
  category: "content",
  description: "Feature grid with icons",
});

registerBlockMeta({
  type: "cta",
  label: "Call to Action",
  icon: "mouse-pointer",
  category: "cta",
  description: "CTA section with button",
});

registerBlockMeta({
  type: "image",
  label: "Image",
  icon: "image",
  category: "media",
  description: "Image with optional caption",
});

registerBlockMeta({
  type: "testimonials",
  label: "Testimonials",
  icon: "message-circle",
  category: "content",
  description: "Customer quotes and reviews",
});

registerBlockMeta({
  type: "gallery",
  label: "Gallery",
  icon: "images",
  category: "media",
  description: "Image gallery or portfolio",
});

registerBlockMeta({
  type: "pricing",
  label: "Pricing",
  icon: "credit-card",
  category: "cta",
  description: "Pricing plans and tiers",
});

registerBlockMeta({
  type: "faq",
  label: "FAQ",
  icon: "help-circle",
  category: "content",
  description: "Frequently asked questions",
});

registerBlockMeta({
  type: "contact",
  label: "Contact",
  icon: "mail",
  category: "cta",
  description: "Contact form and info",
});

registerBlockMeta({
  type: "footer",
  label: "Footer",
  icon: "layout-bottom",
  category: "layout",
  description: "Site footer with links and social",
});

registerBlockMeta({
  type: "about",
  label: "About",
  icon: "users",
  category: "content",
  description: "Company story and team",
});

registerBlockMeta({
  type: "subscribe",
  label: "Subscribe",
  icon: "mail-plus",
  category: "cta",
  description: "Newsletter signup form",
});

registerBlockMeta({
  type: "stats",
  label: "Stats",
  icon: "trending-up",
  category: "content",
  description: "Key numbers and metrics",
});

registerBlockMeta({
  type: "logos",
  label: "Logos",
  icon: "building",
  category: "content",
  description: "Client or partner logos",
});
