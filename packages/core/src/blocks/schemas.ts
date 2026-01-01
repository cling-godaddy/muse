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

const formFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "email", "textarea"]),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

export const contactBlockSchema = blockBase.extend({
  type: z.literal("contact"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  formHeadline: z.string().optional(),
  formFields: z.array(formFieldSchema).optional(),
  submitText: z.string().optional(),
});

const footerLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const socialLinkSchema = z.object({
  platform: z.enum(["twitter", "facebook", "instagram", "linkedin", "youtube", "github", "tiktok"]),
  href: z.string(),
});

export const footerBlockSchema = blockBase.extend({
  type: z.literal("footer"),
  companyName: z.string().optional(),
  copyright: z.string().optional(),
  links: z.array(footerLinkSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

const teamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  image: imageSourceSchema.optional(),
  bio: z.string().optional(),
});

export const aboutBlockSchema = blockBase.extend({
  type: z.literal("about"),
  headline: z.string().optional(),
  body: z.string().optional(),
  image: imageSourceSchema.optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
});

export const subscribeBlockSchema = blockBase.extend({
  type: z.literal("subscribe"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  buttonText: z.string(),
  placeholderText: z.string().optional(),
  disclaimer: z.string().optional(),
});

const statItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

export const statsBlockSchema = blockBase.extend({
  type: z.literal("stats"),
  headline: z.string().optional(),
  stats: z.array(statItemSchema).min(1),
});

const logoItemSchema = z.object({
  image: imageSourceSchema,
  href: z.string().optional(),
});

export const logosBlockSchema = blockBase.extend({
  type: z.literal("logos"),
  headline: z.string().optional(),
  logos: z.array(logoItemSchema).min(1),
});

export const blockSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  featuresBlockSchema,
  ctaBlockSchema,
  testimonialsBlockSchema,
  galleryBlockSchema,
  pricingBlockSchema,
  faqBlockSchema,
  contactBlockSchema,
  footerBlockSchema,
  aboutBlockSchema,
  subscribeBlockSchema,
  statsBlockSchema,
  logosBlockSchema,
]);

export function validateBlock(data: unknown) {
  return blockSchema.safeParse(data);
}

export function validateBlocks(data: unknown) {
  return z.array(blockSchema).safeParse(data);
}
