import type { Page } from "../page/types";

export interface SiteNode {
  pageId: string
  slug: string
  children: SiteNode[]
}

export interface SiteTheme {
  palette: string
  typography: string
}

export type SiteType = "landing" | "full";

export interface Site {
  id: string
  name: string
  description?: string
  location?: string
  siteType?: SiteType
  pages: Record<string, Page>
  tree: SiteNode[]
  theme: SiteTheme
  createdAt: string
  updatedAt: string
}

export interface CreateSiteOptions {
  name: string
  description?: string
  location?: string
  siteType?: SiteType
}

export function createSite(
  nameOrOptions: string | CreateSiteOptions,
  initialPage?: Page,
): Site {
  const opts = typeof nameOrOptions === "string"
    ? { name: nameOrOptions }
    : nameOrOptions;
  const now = new Date().toISOString();
  const site: Site = {
    id: crypto.randomUUID(),
    name: opts.name,
    description: opts.description,
    location: opts.location,
    siteType: opts.siteType,
    pages: {},
    tree: [],
    theme: { palette: "slate", typography: "inter" },
    createdAt: now,
    updatedAt: now,
  };

  if (initialPage) {
    site.pages[initialPage.id] = initialPage;
    site.tree.push({
      pageId: initialPage.id,
      slug: initialPage.slug,
      children: [],
    });
  }

  return site;
}

export function createSiteFromPage(page: Page): Site {
  return createSite(page.meta.title, page);
}
