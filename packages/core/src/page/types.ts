import type { Section } from "../sections/types";

export interface PageMeta {
  title: string
  description?: string
  ogImage?: string
}

export interface Page {
  id: string
  slug: string
  meta: PageMeta
  sections: Section[]
  createdAt?: string
  updatedAt?: string
}

export function createPage(
  slug: string,
  meta: PageMeta,
  sections: Section[] = [],
): Page {
  return {
    id: crypto.randomUUID(),
    slug,
    meta,
    sections,
  };
}
