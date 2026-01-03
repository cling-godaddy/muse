import { z } from "zod";

// Rich content schema for RTE fields
export const richContentSchema = z.object({
  _rich: z.literal(true),
  json: z.unknown(),
  text: z.string(),
});

export const textOrRichSchema = z.union([z.string(), richContentSchema]);

const sectionBase = z.object({
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

export const heroSectionSchema = sectionBase.extend({
  type: z.literal("hero"),
  headline: z.string(),
  subheadline: textOrRichSchema.optional(),
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
  description: textOrRichSchema,
});

export const featuresSectionSchema = sectionBase.extend({
  type: z.literal("features"),
  headline: z.string().optional(),
  items: z.array(featureItemSchema).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export const ctaSectionSchema = sectionBase.extend({
  type: z.literal("cta"),
  headline: z.string(),
  description: textOrRichSchema.optional(),
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

export const testimonialsSectionSchema = sectionBase.extend({
  type: z.literal("testimonials"),
  headline: z.string().optional(),
  quotes: z.array(quoteSchema).min(1),
});

export const gallerySectionSchema = sectionBase.extend({
  type: z.literal("gallery"),
  headline: z.string().optional(),
  images: z.array(imageSourceSchema).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().optional(),
  description: textOrRichSchema.optional(),
  features: z.array(z.string()),
  cta: ctaLinkSchema.optional(),
  highlighted: z.boolean().optional(),
});

export const pricingSectionSchema = sectionBase.extend({
  type: z.literal("pricing"),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  plans: z.array(pricingPlanSchema).min(1),
});

const faqItemSchema = z.object({
  question: z.string(),
  answer: textOrRichSchema,
});

export const faqSectionSchema = sectionBase.extend({
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

export const contactSectionSchema = sectionBase.extend({
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

export const footerSectionSchema = sectionBase.extend({
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
  bio: textOrRichSchema.optional(),
});

export const aboutSectionSchema = sectionBase.extend({
  type: z.literal("about"),
  headline: z.string().optional(),
  body: textOrRichSchema.optional(),
  image: imageSourceSchema.optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
});

export const subscribeSectionSchema = sectionBase.extend({
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
});

export const statsSectionSchema = sectionBase.extend({
  type: z.literal("stats"),
  headline: z.string().optional(),
  stats: z.array(statItemSchema).min(1),
});

const logoItemSchema = z.object({
  image: imageSourceSchema,
  href: z.string().optional(),
});

export const logosSectionSchema = sectionBase.extend({
  type: z.literal("logos"),
  headline: z.string().optional(),
  logos: z.array(logoItemSchema).min(1),
});

const navItemSchema: z.ZodType<{
  label: string
  href: string
  children?: { label: string, href: string, children?: unknown[] }[]
}> = z.lazy(() =>
  z.object({
    label: z.string(),
    href: z.string(),
    children: z.array(navItemSchema).optional(),
  }),
);

export const navbarSectionSchema = sectionBase.extend({
  type: z.literal("navbar"),
  logo: z.object({
    text: z.string().optional(),
    image: imageSourceSchema.optional(),
  }).optional(),
  items: z.array(navItemSchema),
  cta: ctaLinkSchema.optional(),
  sticky: z.boolean().optional(),
});

export const sectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  featuresSectionSchema,
  ctaSectionSchema,
  testimonialsSectionSchema,
  gallerySectionSchema,
  pricingSectionSchema,
  faqSectionSchema,
  contactSectionSchema,
  footerSectionSchema,
  aboutSectionSchema,
  subscribeSectionSchema,
  statsSectionSchema,
  logosSectionSchema,
  navbarSectionSchema,
]);

export function validateSection(data: unknown) {
  return sectionSchema.safeParse(data);
}

export function validateSections(data: unknown) {
  return z.array(sectionSchema).safeParse(data);
}
