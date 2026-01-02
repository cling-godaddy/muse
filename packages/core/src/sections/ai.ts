import type { SectionType } from "./types";
import { getPresetsForType } from "./index";

export const SECTION_TYPES: SectionType[] = [
  "hero",
  "features",
  "testimonials",
  "gallery",
  "pricing",
  "faq",
  "contact",
  "cta",
  "footer",
  "about",
  "subscribe",
  "stats",
  "logos",
  "menu",
  "products",
];

export function generateSectionPrompt(): string {
  const sections = SECTION_TYPES.map((sectionType) => {
    const presets = getPresetsForType(sectionType);
    const presetLines = presets.map(p =>
      `  - ${p.id}: ${p.description} [${p.mood}, ${p.industries.slice(0, 2).join("/")}]`,
    );
    return `${sectionType.toUpperCase()}:\n${presetLines.join("\n")}`;
  });

  return sections.join("\n\n");
}

// AI schema definitions for section generation

export interface AISectionSchema {
  type: SectionType
  description: string
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "array" | "object"
    description: string
    required?: boolean
  }>
  required: string[]
}

const registry = new Map<SectionType, AISectionSchema>();

export function registerAISectionSchema(schema: AISectionSchema): void {
  registry.set(schema.type, schema);
}

export function getAISectionSchema(type: SectionType): AISectionSchema | undefined {
  return registry.get(type);
}

export function getAllAISectionSchemas(): AISectionSchema[] {
  return Array.from(registry.values());
}

export function generateSectionSchemaPrompt(): string {
  return getAllAISectionSchemas().map(s => `
Section: ${s.type}
Description: ${s.description}
Fields:
${Object.entries(s.properties).map(([k, v]) =>
  `  - ${k} (${v.type}${v.required ? ", required" : ""}): ${v.description}`,
).join("\n")}
`).join("\n");
}

registerAISectionSchema({
  type: "hero",
  description: "Hero section with headline, subheadline, call-to-action buttons, and optional background image",
  properties: {
    headline: { type: "string", description: "Main headline text", required: true },
    subheadline: { type: "string", description: "Supporting text below headline" },
    cta: { type: "object", description: "Primary CTA button with text and href" },
    secondaryCta: { type: "object", description: "Secondary CTA button with text and href" },
    alignment: { type: "string", description: "Text alignment: left, center, or right" },
    backgroundImage: { type: "object", description: "Background image with url, alt, provider, providerId" },
    backgroundOverlay: { type: "number", description: "Overlay opacity 0-100 for text readability" },
  },
  required: ["headline"],
});

registerAISectionSchema({
  type: "features",
  description: "Grid of features with icon or image, title, and description",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    items: { type: "array", description: "Array of feature items: { icon: string (emoji like '🚀'), title: string, description: string }", required: true },
    columns: { type: "number", description: "Number of columns: 2, 3, or 4" },
  },
  required: ["items"],
});

registerAISectionSchema({
  type: "cta",
  description: "Call-to-action section with headline, description, and button",
  properties: {
    headline: { type: "string", description: "CTA headline", required: true },
    description: { type: "string", description: "Supporting description text" },
    buttonText: { type: "string", description: "Button label", required: true },
    buttonHref: { type: "string", description: "Button link URL", required: true },
    variant: { type: "string", description: "Button style: primary or secondary" },
  },
  required: ["headline", "buttonText", "buttonHref"],
});

registerAISectionSchema({
  type: "testimonials",
  description: "Customer testimonials section with quotes",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    quotes: { type: "array", description: "Array of quotes with text, author, role, company, avatar", required: true },
  },
  required: ["quotes"],
});

registerAISectionSchema({
  type: "gallery",
  description: "Image gallery or portfolio section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    images: { type: "array", description: "Array of images with url, alt", required: true },
    columns: { type: "number", description: "Number of columns: 2, 3, or 4" },
  },
  required: ["images"],
});

registerAISectionSchema({
  type: "pricing",
  description: "Pricing plans and tiers section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    subheadline: { type: "string", description: "Optional supporting text" },
    plans: { type: "array", description: "Array of plans with name, price, period, description, features, cta, highlighted", required: true },
  },
  required: ["plans"],
});

registerAISectionSchema({
  type: "faq",
  description: "Frequently asked questions section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    subheadline: { type: "string", description: "Optional supporting text" },
    items: { type: "array", description: "Array of FAQ items with question and answer", required: true },
  },
  required: ["items"],
});

registerAISectionSchema({
  type: "contact",
  description: "Contact information and form section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    subheadline: { type: "string", description: "Optional supporting text" },
    email: { type: "string", description: "Contact email address" },
    phone: { type: "string", description: "Contact phone number" },
    address: { type: "string", description: "Physical address" },
    formHeadline: { type: "string", description: "Form section headline, e.g. 'Send us a message'" },
    formFields: { type: "array", description: "Array of form fields: { name, type (text/email/textarea), label, placeholder, required }" },
    submitText: { type: "string", description: "Submit button text, e.g. 'Send Message'" },
  },
  required: [],
});

registerAISectionSchema({
  type: "footer",
  description: "Site footer with navigation links, social links, and copyright",
  properties: {
    companyName: { type: "string", description: "Company or brand name" },
    copyright: { type: "string", description: "Copyright text, e.g. '2024 Company. All rights reserved.'" },
    links: { type: "array", description: "Array of links: { label, href }" },
    socialLinks: { type: "array", description: "Array of social links: { platform (twitter/facebook/instagram/linkedin/youtube/github/tiktok), href }" },
  },
  required: [],
});

registerAISectionSchema({
  type: "about",
  description: "About section with company story, mission, or team showcase",
  properties: {
    headline: { type: "string", description: "Section headline" },
    body: { type: "string", description: "Company story or mission text (can be multiple paragraphs)" },
    image: { type: "object", description: "Featured image with url, alt" },
    teamMembers: { type: "array", description: "Array of team members: { name, role, image, bio }" },
  },
  required: [],
});

registerAISectionSchema({
  type: "subscribe",
  description: "Newsletter subscription form for email capture",
  properties: {
    headline: { type: "string", description: "Main headline, e.g. 'Stay in the loop'" },
    subheadline: { type: "string", description: "Supporting text, e.g. 'Join 10,000+ subscribers'" },
    buttonText: { type: "string", description: "Submit button text", required: true },
    placeholderText: { type: "string", description: "Input placeholder, e.g. 'Enter your email'" },
    disclaimer: { type: "string", description: "Privacy disclaimer, e.g. 'No spam. Unsubscribe anytime.'" },
  },
  required: ["buttonText"],
});

registerAISectionSchema({
  type: "stats",
  description: "Key metrics and numbers showcase",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    stats: { type: "array", description: "Array of stat items: { value, label, prefix (e.g. '$'), suffix (e.g. '+') }", required: true },
  },
  required: ["stats"],
});

registerAISectionSchema({
  type: "logos",
  description: "Client, partner, or press logo cloud",
  properties: {
    headline: { type: "string", description: "Optional headline, e.g. 'Trusted by'" },
    logos: { type: "array", description: "Array of logos: { image: { url, alt }, href (optional) }", required: true },
  },
  required: ["logos"],
});

registerAISectionSchema({
  type: "menu",
  description: "Restaurant or cafe menu with categories and items",
  properties: {
    headline: { type: "string", description: "Optional section headline, e.g. 'Our Menu'" },
    subheadline: { type: "string", description: "Optional supporting text" },
    categories: { type: "array", description: "Array of menu categories: { name, items: [{ name, description, price, tags (e.g. 'vegan', 'gf', 'spicy') }] }", required: true },
  },
  required: ["categories"],
});

registerAISectionSchema({
  type: "products",
  description: "E-commerce product catalog or showcase",
  properties: {
    headline: { type: "string", description: "Optional section headline, e.g. 'Shop Our Collection'" },
    subheadline: { type: "string", description: "Optional supporting text" },
    items: { type: "array", description: "Array of products: { name, price, originalPrice (for sales), badge (e.g. 'New', 'Sale') }", required: true },
  },
  required: ["items"],
});
