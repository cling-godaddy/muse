import { z } from "zod";

const blockBase = z.object({
  id: z.string().uuid(),
  version: z.number().optional(),
});

export const textBlockSchema = blockBase.extend({
  type: z.literal("text"),
  content: z.string(),
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
]);

export function validateBlock(data: unknown) {
  return blockSchema.safeParse(data);
}

export function validateBlocks(data: unknown) {
  return z.array(blockSchema).safeParse(data);
}
