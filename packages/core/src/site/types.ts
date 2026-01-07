import type { Page } from "../page/types";
import type { NavbarSection } from "../sections/types";

// AI usage tracking (duplicated from @muse/ai to avoid circular dependency)
export type UsageAction = "generate_site" | "generate_section" | "generate_item" | "refine";

export interface Usage {
  input: number
  output: number
  cost: number
  model: string
  action?: UsageAction
  detail?: string
  timestamp?: string
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
  theme: SiteTheme
  navbar?: NavbarSection
  costs?: Usage[]
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
    theme: { palette: "slate", typography: "inter" },
    createdAt: now,
    updatedAt: now,
  };

  if (initialPage) {
    site.pages[initialPage.id] = initialPage;
  }

  return site;
}

export function createSiteFromPage(page: Page): Site {
  return createSite(page.meta.title, page);
}
