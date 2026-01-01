import type { BlockType } from "./types";

export interface AIBlockSchema {
  type: BlockType
  description: string
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "array" | "object"
    description: string
    required?: boolean
  }>
  required: string[]
}

const registry = new Map<BlockType, AIBlockSchema>();

export function registerAISchema(schema: AIBlockSchema): void {
  registry.set(schema.type, schema);
}

export function getAISchema(type: BlockType): AIBlockSchema | undefined {
  return registry.get(type);
}

export function getAllAISchemas(): AIBlockSchema[] {
  return Array.from(registry.values());
}

export function generateBlockSchemaPrompt(): string {
  return getAllAISchemas().map(s => `
Block: ${s.type}
Description: ${s.description}
Fields:
${Object.entries(s.properties).map(([k, v]) =>
  `  - ${k} (${v.type}${v.required ? ", required" : ""}): ${v.description}`,
).join("\n")}
`).join("\n");
}

registerAISchema({
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

registerAISchema({
  type: "features",
  description: "Grid of features with icon or image, title, and description",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    items: { type: "array", description: "Array of feature items: { icon: string (emoji like '🚀'), title: string, description: string }", required: true },
    columns: { type: "number", description: "Number of columns: 2, 3, or 4" },
  },
  required: ["items"],
});

registerAISchema({
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

registerAISchema({
  type: "image",
  description: "Standalone image block with optional caption",
  properties: {
    image: { type: "object", description: "Image source with url, alt, provider, providerId", required: true },
    caption: { type: "string", description: "Optional caption below image" },
    size: { type: "string", description: "Display size: small, medium, large, or full" },
  },
  required: ["image"],
});

registerAISchema({
  type: "testimonials",
  description: "Customer testimonials section with quotes",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    quotes: { type: "array", description: "Array of quotes with text, author, role, company, avatar", required: true },
  },
  required: ["quotes"],
});

registerAISchema({
  type: "gallery",
  description: "Image gallery or portfolio section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    images: { type: "array", description: "Array of images with url, alt", required: true },
    columns: { type: "number", description: "Number of columns: 2, 3, or 4" },
  },
  required: ["images"],
});

registerAISchema({
  type: "pricing",
  description: "Pricing plans and tiers section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    subheadline: { type: "string", description: "Optional supporting text" },
    plans: { type: "array", description: "Array of plans with name, price, period, description, features, cta, highlighted", required: true },
  },
  required: ["plans"],
});

registerAISchema({
  type: "faq",
  description: "Frequently asked questions section",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    subheadline: { type: "string", description: "Optional supporting text" },
    items: { type: "array", description: "Array of FAQ items with question and answer", required: true },
  },
  required: ["items"],
});

registerAISchema({
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

registerAISchema({
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

registerAISchema({
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

registerAISchema({
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

registerAISchema({
  type: "stats",
  description: "Key metrics and numbers showcase",
  properties: {
    headline: { type: "string", description: "Optional section headline" },
    stats: { type: "array", description: "Array of stat items: { value, label, prefix (e.g. '$'), suffix (e.g. '+') }", required: true },
  },
  required: ["stats"],
});

registerAISchema({
  type: "logos",
  description: "Client, partner, or press logo cloud",
  properties: {
    headline: { type: "string", description: "Optional headline, e.g. 'Trusted by'" },
    logos: { type: "array", description: "Array of logos: { image: { url, alt }, href (optional) }", required: true },
  },
  required: ["logos"],
});
