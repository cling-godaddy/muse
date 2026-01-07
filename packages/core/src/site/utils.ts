import type { Page } from "../page/types";
import type { Site } from "./types";

export interface FlattenedPage {
  page: Page
  path: string
  depth: number
}

// Compute full path for a page by walking up parentId chain
export function getPagePath(site: Site, pageId: string): string | null {
  const page = site.pages[pageId];
  if (!page) return null;

  if (!page.parentId) {
    return page.slug === "/" ? "/" : `/${page.slug}`;
  }

  const parentPath = getPagePath(site, page.parentId);
  if (!parentPath) return `/${page.slug}`;

  return parentPath === "/" ? `/${page.slug}` : `${parentPath}/${page.slug}`;
}

// Find a page by its full path (e.g., "/services/web-design")
export function getPageByPath(site: Site, path: string): Page | null {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");

  for (const page of Object.values(site.pages)) {
    if (getPagePath(site, page.id) === normalized) {
      return page;
    }
  }

  return null;
}

// Get all pages flattened in tree order with depth info
export function getPagesFlattened(site: Site): FlattenedPage[] {
  const pages = Object.values(site.pages);
  const result: FlattenedPage[] = [];

  function traverse(parentId: string | null, depth: number) {
    const children = pages
      .filter(p => p.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    for (const page of children) {
      const path = getPagePath(site, page.id) ?? `/${page.slug}`;
      result.push({ page, path, depth });
      traverse(page.id, depth + 1);
    }
  }

  traverse(null, 0);
  return result;
}

// Get all descendants of a page (for cascade delete confirmation)
export function getPageDescendants(site: Site, pageId: string): Page[] {
  const result: Page[] = [];

  function collect(id: string) {
    const children = Object.values(site.pages).filter(p => p.parentId === id);
    for (const child of children) {
      result.push(child);
      collect(child.id);
    }
  }

  collect(pageId);
  return result;
}

// Check if a path exists in the site
export function pathExists(site: Site, path: string): boolean {
  return getPageByPath(site, path) !== null;
}

// Add a page to the site
export function addPage(
  site: Site,
  page: Page,
): Site {
  return {
    ...site,
    pages: { ...site.pages, [page.id]: page },
    updatedAt: new Date().toISOString(),
  };
}

// Remove a page and all its descendants from the site
export function removePage(site: Site, pageId: string): Site {
  const descendants = getPageDescendants(site, pageId);
  const toRemove = new Set([pageId, ...descendants.map(d => d.id)]);

  const remainingPages = Object.fromEntries(
    Object.entries(site.pages).filter(([id]) => !toRemove.has(id)),
  );

  return {
    ...site,
    pages: remainingPages,
    updatedAt: new Date().toISOString(),
  };
}

// Move a page to a new parent
export function movePage(
  site: Site,
  pageId: string,
  newParentId: string | null,
): Site {
  const page = site.pages[pageId];
  if (!page) return site;

  // Compute new order (append to end of new parent's children)
  const siblings = Object.values(site.pages).filter(p => p.parentId === newParentId);
  const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : -1;

  return {
    ...site,
    pages: {
      ...site.pages,
      [pageId]: { ...page, parentId: newParentId, order: maxOrder + 1 },
    },
    updatedAt: new Date().toISOString(),
  };
}
