import { z } from "zod";
import { field, toZodShape, type FieldDef } from "./fields";

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
  backgroundColor: z.string().optional(),
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

// --- Hero ---
export const heroFields = {
  type: field(z.literal("hero"), { editable: false }),
  headline: field(textOrRichSchema, { aliases: ["title", "heading"] }),
  subheadline: field(textOrRichSchema.optional(), { aliases: ["subheading", "tagline", "subtitle"] }),
  cta: field(ctaLinkSchema.optional(), { aliases: ["button", "action", "primary button"] }),
  secondaryCta: field(ctaLinkSchema.optional(), { aliases: ["secondary button", "second button"] }),
  alignment: field(z.enum(["left", "center", "right"]).optional()),
  backgroundImage: field(imageSourceSchema.optional(), { editable: false }),
  backgroundOverlay: field(z.number().min(0).max(100).optional()),
};

export const heroSectionSchema = sectionBase.extend(toZodShape(heroFields));

const featureItemSchema = z.object({
  icon: z.string().optional(),
  image: imageSourceSchema.optional(),
  title: z.string(),
  description: textOrRichSchema,
});

// --- Features ---
export const featuresFields = {
  type: field(z.literal("features"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  items: field(z.array(featureItemSchema).min(1), { aliases: ["features"] }),
  columns: field(z.union([z.literal(2), z.literal(3), z.literal(4)]).optional()),
};

export const featuresSectionSchema = sectionBase.extend(toZodShape(featuresFields));

// --- CTA ---
export const ctaFields = {
  type: field(z.literal("cta"), { editable: false }),
  headline: field(textOrRichSchema, { aliases: ["title", "heading"] }),
  description: field(textOrRichSchema.optional(), { aliases: ["body", "text", "subheadline"] }),
  buttonText: field(z.string(), { aliases: ["button", "cta text", "action text"] }),
  buttonHref: field(z.string(), { aliases: ["button link", "cta link", "action link"] }),
  variant: field(z.enum(["primary", "secondary"]).optional()),
};

export const ctaSectionSchema = sectionBase.extend(toZodShape(ctaFields));

const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: imageSourceSchema.optional(),
});

// --- Testimonials ---
export const testimonialsFields = {
  type: field(z.literal("testimonials"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  quotes: field(z.array(quoteSchema).min(1), { aliases: ["testimonials", "reviews"] }),
};

export const testimonialsSectionSchema = sectionBase.extend(toZodShape(testimonialsFields));

// --- Gallery ---
export const galleryFields = {
  type: field(z.literal("gallery"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  images: field(z.array(imageSourceSchema).min(1), { editable: false }),
  columns: field(z.union([z.literal(2), z.literal(3), z.literal(4)]).optional()),
};

export const gallerySectionSchema = sectionBase.extend(toZodShape(galleryFields));

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().optional(),
  description: textOrRichSchema.optional(),
  features: z.array(z.string()),
  cta: ctaLinkSchema.optional(),
  highlighted: z.boolean().optional(),
});

// --- Pricing ---
export const pricingFields = {
  type: field(z.literal("pricing"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  subheadline: field(z.string().optional(), { aliases: ["subheading", "tagline", "subtitle"] }),
  plans: field(z.array(pricingPlanSchema).min(1), { aliases: ["tiers", "pricing plans"] }),
};

export const pricingSectionSchema = sectionBase.extend(toZodShape(pricingFields));

const faqItemSchema = z.object({
  question: z.string(),
  answer: textOrRichSchema,
});

// --- FAQ ---
export const faqFields = {
  type: field(z.literal("faq"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  subheadline: field(z.string().optional(), { aliases: ["subheading", "subtitle"] }),
  items: field(z.array(faqItemSchema).min(1), { aliases: ["questions", "faqs"] }),
};

export const faqSectionSchema = sectionBase.extend(toZodShape(faqFields));

const formFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "email", "textarea"]),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

// --- Contact ---
export const contactFields = {
  type: field(z.literal("contact"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  subheadline: field(z.string().optional(), { aliases: ["subheading", "subtitle"] }),
  email: field(z.string().optional(), { aliases: ["email address"] }),
  phone: field(z.string().optional(), { aliases: ["phone number", "telephone"] }),
  address: field(z.string().optional(), { aliases: ["location"] }),
  formHeadline: field(z.string().optional(), { aliases: ["form title"] }),
  formFields: field(z.array(formFieldSchema).optional(), { editable: false }),
  submitText: field(z.string().optional(), { aliases: ["submit button", "button text"] }),
};

export const contactSectionSchema = sectionBase.extend(toZodShape(contactFields));

const footerLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const socialLinkSchema = z.object({
  platform: z.enum(["twitter", "facebook", "instagram", "linkedin", "youtube", "github", "tiktok"]),
  href: z.string(),
});

// --- Footer ---
export const footerFields = {
  type: field(z.literal("footer"), { editable: false }),
  companyName: field(z.string().optional(), { aliases: ["company", "business name"] }),
  copyright: field(z.string().optional(), { aliases: ["copyright text"] }),
  links: field(z.array(footerLinkSchema).optional(), { aliases: ["footer links", "navigation"] }),
  socialLinks: field(z.array(socialLinkSchema).optional(), { aliases: ["social media", "socials"] }),
};

export const footerSectionSchema = sectionBase.extend(toZodShape(footerFields));

const teamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  image: imageSourceSchema.optional(),
  bio: textOrRichSchema.optional(),
});

// --- About ---
export const aboutFields = {
  type: field(z.literal("about"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  body: field(textOrRichSchema.optional(), { aliases: ["description", "content", "text"] }),
  image: field(imageSourceSchema.optional(), { editable: false }),
  teamMembers: field(z.array(teamMemberSchema).optional(), { aliases: ["team", "members"] }),
};

export const aboutSectionSchema = sectionBase.extend(toZodShape(aboutFields));

// --- Subscribe ---
export const subscribeFields = {
  type: field(z.literal("subscribe"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  subheadline: field(z.string().optional(), { aliases: ["subheading", "subtitle"] }),
  buttonText: field(z.string(), { aliases: ["button", "submit text"] }),
  placeholderText: field(z.string().optional(), { aliases: ["placeholder", "input placeholder"] }),
  disclaimer: field(z.string().optional(), { aliases: ["fine print", "terms"] }),
};

export const subscribeSectionSchema = sectionBase.extend(toZodShape(subscribeFields));

const statItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// --- Stats ---
export const statsFields = {
  type: field(z.literal("stats"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  stats: field(z.array(statItemSchema).min(1), { aliases: ["statistics", "metrics", "numbers"] }),
};

export const statsSectionSchema = sectionBase.extend(toZodShape(statsFields));

const logoItemSchema = z.object({
  image: imageSourceSchema,
  href: z.string().optional(),
});

// --- Logos ---
export const logosFields = {
  type: field(z.literal("logos"), { editable: false }),
  headline: field(textOrRichSchema.optional(), { aliases: ["title", "heading"] }),
  logos: field(z.array(logoItemSchema).min(1), { editable: false }),
};

export const logosSectionSchema = sectionBase.extend(toZodShape(logosFields));

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

// --- Navbar ---
export const navbarFields = {
  type: field(z.literal("navbar"), { editable: false }),
  logo: field(z.object({
    text: z.string().optional(),
    image: imageSourceSchema.optional(),
  }).optional(), { aliases: ["logo text", "brand"] }),
  items: field(z.array(navItemSchema), { aliases: ["navigation", "nav items", "menu"] }),
  cta: field(ctaLinkSchema.optional(), { aliases: ["button", "action"] }),
  sticky: field(z.boolean().optional()),
};

export const navbarSectionSchema = sectionBase.extend(toZodShape(navbarFields));

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

// Field registry for runtime lookup
export const sectionFieldRegistry: Record<string, Record<string, FieldDef>> = {
  hero: heroFields,
  features: featuresFields,
  cta: ctaFields,
  testimonials: testimonialsFields,
  gallery: galleryFields,
  pricing: pricingFields,
  faq: faqFields,
  contact: contactFields,
  footer: footerFields,
  about: aboutFields,
  subscribe: subscribeFields,
  stats: statsFields,
  logos: logosFields,
  navbar: navbarFields,
};
