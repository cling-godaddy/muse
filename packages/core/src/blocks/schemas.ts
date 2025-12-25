import { z } from "zod";

const blockBase = z.object({
  id: z.string().uuid(),
  version: z.number().optional(),
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

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  heroBlockSchema,
  featuresBlockSchema,
  ctaBlockSchema,
  imageBlockSchema,
]);

export function validateBlock(data: unknown) {
  return blockSchema.safeParse(data);
}

export function validateBlocks(data: unknown) {
  return z.array(blockSchema).safeParse(data);
}
