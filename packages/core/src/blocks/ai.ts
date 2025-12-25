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
  type: "text",
  description: "Text content block for paragraphs and prose",
  properties: {
    content: { type: "string", description: "Text content", required: true },
  },
  required: ["content"],
});

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
    items: { type: "array", description: "Array of feature items with icon or image, title, description", required: true },
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
  },
  required: [],
});
