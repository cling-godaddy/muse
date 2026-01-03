import type { Page } from "../page/types";
import type { Site, SiteNode } from "./types";

export interface FlattenedPage {
  page: Page
  path: string
  depth: number
}

// Find a node by pageId in the tree (recursive)
function findNodeById(nodes: SiteNode[], pageId: string): { node: SiteNode, path: string[] } | null {
  for (const node of nodes) {
    if (node.pageId === pageId) {
      return { node, path: [node.slug] };
    }
    const found = findNodeById(node.children, pageId);
    if (found) {
      return { node: found.node, path: [node.slug, ...found.path] };
    }
  }
  return null;
}

// Compute full path for a page by traversing the tree
export function getPagePath(site: Site, pageId: string): string | null {
  const result = findNodeById(site.tree, pageId);
  if (!result) return null;

  const segments = result.path;
  // Root page (slug "/") should return "/"
  if (segments.length === 1 && segments[0] === "/") {
    return "/";
  }
  // Build path from segments, handling root
  return "/" + segments.filter(s => s !== "/").join("/");
}

// Find a page by its full path (e.g., "/services/web-design")
export function getPageByPath(site: Site, path: string): Page | null {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");
  const segments = normalized === "/" ? ["/"] : normalized.split("/").filter(Boolean);

  let nodes = site.tree;
  let currentNode: SiteNode | null = null;

  for (let i = 0; i < segments.length; i++) {
    const segment = i === 0 && normalized === "/" ? "/" : segments[i];
    const found = nodes.find(n => n.slug === segment);
    if (!found) return null;
    currentNode = found;
    nodes = found.children;
  }

  if (!currentNode) return null;
  return site.pages[currentNode.pageId] ?? null;
}

// Get all pages flattened in tree order with depth info
export function getPagesFlattened(site: Site): FlattenedPage[] {
  const result: FlattenedPage[] = [];

  function traverse(nodes: SiteNode[], parentPath: string, depth: number) {
    for (const node of nodes) {
      const page = site.pages[node.pageId];
      if (!page) continue;

      const path = node.slug === "/"
        ? "/"
        : parentPath === "/"
          ? `/${node.slug}`
          : `${parentPath}/${node.slug}`;

      result.push({ page, path, depth });
      traverse(node.children, path, depth + 1);
    }
  }

  traverse(site.tree, "", 0);
  return result;
}

// Check if a path exists in the site
export function pathExists(site: Site, path: string): boolean {
  return getPageByPath(site, path) !== null;
}

// Add a page to the site at a given parent path
export function addPage(
  site: Site,
  page: Page,
  parentPath?: string,
): Site {
  const updatedSite = {
    ...site,
    pages: { ...site.pages, [page.id]: page },
    tree: [...site.tree],
    updatedAt: new Date().toISOString(),
  };

  const newNode: SiteNode = {
    pageId: page.id,
    slug: page.slug,
    children: [],
  };

  if (!parentPath || parentPath === "/") {
    // Add to root level
    updatedSite.tree.push(newNode);
  }
  else {
    // Find parent and add as child
    const insertIntoTree = (nodes: SiteNode[], targetPath: string): boolean => {
      for (const node of nodes) {
        const nodePath = getPagePath(updatedSite, node.pageId);
        if (nodePath === targetPath) {
          node.children = [...node.children, newNode];
          return true;
        }
        if (insertIntoTree(node.children, targetPath)) {
          return true;
        }
      }
      return false;
    };

    if (!insertIntoTree(updatedSite.tree, parentPath)) {
      // Parent not found, add to root
      updatedSite.tree.push(newNode);
    }
  }

  return updatedSite;
}

// Remove a page from the site
export function removePage(site: Site, pageId: string): Site {
  const removeFromTree = (nodes: SiteNode[]): SiteNode[] => {
    return nodes
      .filter(n => n.pageId !== pageId)
      .map(n => ({ ...n, children: removeFromTree(n.children) }));
  };

  const remainingPages = Object.fromEntries(
    Object.entries(site.pages).filter(([id]) => id !== pageId),
  );

  return {
    ...site,
    pages: remainingPages,
    tree: removeFromTree(site.tree),
    updatedAt: new Date().toISOString(),
  };
}

// Move a page to a new parent
export function movePage(
  site: Site,
  pageId: string,
  newParentPath?: string,
): Site {
  const result = findNodeById(site.tree, pageId);
  if (!result) return site;

  // Remove from current location
  const withoutPage = removePage(site, pageId);

  // Re-add at new location (keeping the page data)
  const page = site.pages[pageId];
  if (!page) return site;

  return addPage(
    { ...withoutPage, pages: { ...withoutPage.pages, [pageId]: page } },
    page,
    newParentPath,
  );
}
