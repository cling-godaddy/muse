import { z } from "zod";
import { sectionSchema } from "../sections/schemas";

export const pageMetaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

export const pageSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  parentId: z.string().uuid().nullable(),
  order: z.number(),
  meta: pageMetaSchema,
  sections: z.array(sectionSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function validatePage(data: unknown) {
  return pageSchema.safeParse(data);
}
