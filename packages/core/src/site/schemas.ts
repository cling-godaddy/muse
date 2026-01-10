import { z } from "zod";
import { pageSchema } from "../page/schemas";
import { sectionSchema } from "../sections/schemas";

export const siteThemeSchema = z.object({
  palette: z.string(),
  typography: z.string(),
});

export const siteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  pages: z.record(z.string().uuid(), pageSchema),
  theme: siteThemeSchema,
  sharedSections: z.array(sectionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function validateSite(data: unknown) {
  return siteSchema.safeParse(data);
}
