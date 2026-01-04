import { z } from "zod";
import { pageSchema } from "../page/schemas";
import { navbarSectionSchema } from "../sections/schemas";

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
  navbar: navbarSectionSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function validateSite(data: unknown) {
  return siteSchema.safeParse(data);
}
