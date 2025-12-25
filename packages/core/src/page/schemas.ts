import { z } from "zod";
import { blockSchema } from "../blocks/schemas";

export const pageMetaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

export const pageSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  meta: pageMetaSchema,
  blocks: z.array(blockSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function validatePage(data: unknown) {
  return pageSchema.safeParse(data);
}
