import type { SectionType } from "./types";

export interface SectionMeta {
  type: SectionType
  label: string
  icon: string // PascalCase to match lucide-react component names
  category: "content" | "layout" | "media" | "cta"
  description: string
}

const SECTION_META: SectionMeta[] = [
  { type: "hero", label: "Hero", icon: "PanelTop", category: "layout", description: "Large header with headline and call-to-action" },
  { type: "features", label: "Features", icon: "Grid3x3", category: "content", description: "Showcase product features in a grid or list" },
  { type: "cta", label: "Call to Action", icon: "MousePointerClick", category: "cta", description: "Drive users to take action" },
  { type: "testimonials", label: "Testimonials", icon: "Quote", category: "content", description: "Customer reviews and quotes" },
  { type: "pricing", label: "Pricing", icon: "DollarSign", category: "cta", description: "Pricing tables and plans" },
  { type: "faq", label: "FAQ", icon: "HelpCircle", category: "content", description: "Frequently asked questions" },
  { type: "gallery", label: "Gallery", icon: "Images", category: "media", description: "Image gallery or portfolio" },
  { type: "stats", label: "Stats", icon: "BarChart3", category: "content", description: "Key metrics and statistics" },
  { type: "contact", label: "Contact", icon: "Mail", category: "cta", description: "Contact form and information" },
  { type: "about", label: "About", icon: "Users", category: "content", description: "About us or company story" },
  { type: "logos", label: "Logos", icon: "Shapes", category: "content", description: "Client or partner logos" },
  { type: "subscribe", label: "Subscribe", icon: "Bell", category: "cta", description: "Newsletter signup form" },
  { type: "products", label: "Products", icon: "ShoppingBag", category: "content", description: "Product listings and cards" },
  { type: "menu", label: "Menu", icon: "UtensilsCrossed", category: "content", description: "Restaurant or service menu" },
  { type: "navbar", label: "Navbar", icon: "PanelTopOpen", category: "layout", description: "Navigation bar" },
  { type: "footer", label: "Footer", icon: "PanelBottom", category: "layout", description: "Page footer with links" },
];

const metaByType = new Map(SECTION_META.map(m => [m.type, m]));

export function getSectionMeta(type: SectionType): SectionMeta | undefined {
  return metaByType.get(type);
}

export function getAllSectionMeta(): SectionMeta[] {
  return SECTION_META;
}
