import type { Page } from "../page/types";
import type { ImageSource } from "../sections/types";

export interface SiteNode {
  pageId: string
  slug: string
  children: SiteNode[]
}

export interface NavbarLink {
  label: string
  href: string
}

export interface NavbarConfig {
  logo?: { text?: string, image?: ImageSource }
  items?: NavbarLink[]
  cta?: { text: string, href: string }
}

export interface SiteTheme {
  palette: string
  typography: string
}

export interface Site {
  id: string
  name: string
  pages: Record<string, Page>
  tree: SiteNode[]
  theme: SiteTheme
  navbar: NavbarConfig
  createdAt: string
  updatedAt: string
}

export function createSite(
  name: string,
  initialPage?: Page,
): Site {
  const now = new Date().toISOString();
  const site: Site = {
    id: crypto.randomUUID(),
    name,
    pages: {},
    tree: [],
    theme: { palette: "slate", typography: "inter" },
    navbar: {},
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
