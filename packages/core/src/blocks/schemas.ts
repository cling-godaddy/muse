import { z } from "zod";

const blockBase = z.object({
  id: z.string().uuid(),
  version: z.number().optional(),
  preset: z.string().optional(),
});

export const imageSourceSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  provider: z.string().optional(),
  providerId: z.string().optional(),
});

export const textBlockSchema = blockBase.extend({
  type: z.literal("text"),
  content: z.string(),
});

const ctaLinkSchema = z.object({
  text: z.string(),
  href: z.string(),
});

export const heroBlockSchema = blockBase.extend({
  type: z.literal("hero"),
  headline: z.string(),
  subheadline: z.string().optional(),
  cta: ctaLinkSchema.optional(),
  secondaryCta: ctaLinkSchema.optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  backgroundImage: imageSourceSchema.optional(),
  backgroundOverlay: z.number().min(0).max(100).optional(),
});

const featureItemSchema = z.object({
  icon: z.string().optional(),
  image: imageSourceSchema.optional(),
  title: z.string(),
  description: z.string(),
});

export const featuresBlockSchema = blockBase.extend({
  type: z.literal("features"),
  headline: z.string().optional(),
  items: z.array(featureItemSchema).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export const ctaBlockSchema = blockBase.extend({
  type: z.literal("cta"),
  headline: z.string(),
  description: z.string().optional(),
  buttonText: z.string(),
  buttonHref: z.string(),
  variant: z.enum(["primary", "secondary"]).optional(),
});

export const imageBlockSchema = blockBase.extend({
  type: z.literal("image"),
  image: imageSourceSchema,
  caption: z.string().optional(),
  size: z.enum(["small", "medium", "large", "full"]).optional(),
});

const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: imageSourceSchema.optional(),
});

export const testimonialsBlockSchema = blockBase.extend({
  type: z.literal("testimonials"),
  headline: z.string().optional(),
  quotes: z.array(quoteSchema).min(1),
});

export const galleryBlockSchema = blockBase.extend({
  type: z.literal("gallery"),
  headline: z.string().optional(),
  images: z.array(imageSourceSchema).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()),
  cta: ctaLinkSchema.optional(),
  highlighted: z.boolean().optional(),
});

export const pricingBlockSchema = blockBase.extend({
  type: z.literal("pricing"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  plans: z.array(pricingPlanSchema).min(1),
});

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const faqBlockSchema = blockBase.extend({
  type: z.literal("faq"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  items: z.array(faqItemSchema).min(1),
});

export const contactBlockSchema = blockBase.extend({
  type: z.literal("contact"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  heroBlockSchema,
  featuresBlockSchema,
  ctaBlockSchema,
  imageBlockSchema,
  testimonialsBlockSchema,
  galleryBlockSchema,
  pricingBlockSchema,
  faqBlockSchema,
  contactBlockSchema,
]);

export function validateBlock(data: unknown) {
  return blockSchema.safeParse(data);
}

export function validateBlocks(data: unknown) {
  return z.array(blockSchema).safeParse(data);
}
