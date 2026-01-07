import type { Section } from "../sections/types";

export interface PageMeta {
  title: string
  description?: string
  ogImage?: string
}

export interface Page {
  id: string
  slug: string
  parentId: string | null // null = root page
  order: number // sibling ordering
  meta: PageMeta
  sections: Section[]
  createdAt?: string
  updatedAt?: string
}

export interface CreatePageOptions {
  slug: string
  meta: PageMeta
  sections?: Section[]
  parentId?: string | null
  order?: number
}

export function createPage(
  slugOrOptions: string | CreatePageOptions,
  meta?: PageMeta,
  sections: Section[] = [],
): Page {
  if (typeof slugOrOptions === "string") {
    // Legacy signature: createPage(slug, meta, sections)
    if (!meta) throw new Error("meta is required when using legacy createPage signature");
    return {
      id: crypto.randomUUID(),
      slug: slugOrOptions,
      parentId: null,
      order: 0,
      meta,
      sections,
    };
  }

  // New signature: createPage(options)
  const opts = slugOrOptions;
  return {
    id: crypto.randomUUID(),
    slug: opts.slug,
    parentId: opts.parentId ?? null,
    order: opts.order ?? 0,
    meta: opts.meta,
    sections: opts.sections ?? [],
  };
}
