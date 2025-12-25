import type { Block } from "../blocks/types";

export interface PageMeta {
  title: string
  description?: string
  ogImage?: string
}

export interface Page {
  id: string
  slug: string
  meta: PageMeta
  blocks: Block[]
  createdAt?: string
  updatedAt?: string
}

export function createPage(
  slug: string,
  meta: PageMeta,
  blocks: Block[] = [],
): Page {
  return {
    id: crypto.randomUUID(),
    slug,
    meta,
    blocks,
  };
}
