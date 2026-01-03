import { z } from "zod";
import { pageSchema } from "../page/schemas";
import { imageSourceSchema } from "../sections/schemas";

export const siteNodeSchema: z.ZodType<{
  pageId: string
  slug: string
  children: { pageId: string, slug: string, children: unknown[] }[]
}> = z.lazy(() =>
  z.object({
    pageId: z.string().uuid(),
    slug: z.string(),
    children: z.array(siteNodeSchema),
  }),
);

export const navbarConfigSchema = z.object({
  logo: z.object({
    text: z.string().optional(),
    image: imageSourceSchema.optional(),
  }).optional(),
  cta: z.object({
    text: z.string(),
    href: z.string(),
  }).optional(),
});

export const siteThemeSchema = z.object({
  palette: z.string(),
  typography: z.string(),
});

export const siteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  pages: z.record(z.string().uuid(), pageSchema),
  tree: z.array(siteNodeSchema),
  theme: siteThemeSchema,
  navbar: navbarConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function validateSite(data: unknown) {
  return siteSchema.safeParse(data);
}
