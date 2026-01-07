import { describe, expect, it } from "vitest";
import {
  getPagePath,
  getPageByPath,
  getPagesFlattened,
  getPageDescendants,
  pathExists,
  addPage,
  removePage,
  movePage,
} from "../../src/site/utils";
import { createSite } from "../../src/site/types";
import { createPage } from "../../src/page/types";
import type { Site } from "../../src/site/types";

interface PageIds {
  home: string
  about: string
  services: string
  webDesign: string
  contact: string
}

function createTestSite() {
  const home = createPage({ slug: "/", meta: { title: "Home" }, parentId: null, order: 0 });
  const about = createPage({ slug: "about", meta: { title: "About" }, parentId: null, order: 1 });
  const services = createPage({ slug: "services", meta: { title: "Services" }, parentId: null, order: 2 });
  const webDesign = createPage({ slug: "web-design", meta: { title: "Web Design" }, parentId: services.id, order: 0 });
  const contact = createPage({ slug: "contact", meta: { title: "Contact" }, parentId: null, order: 3 });

  const site: Site & { _pageIds: PageIds } = {
    id: "site-1",
    name: "Test Site",
    pages: {
      [home.id]: home,
      [about.id]: about,
      [services.id]: services,
      [webDesign.id]: webDesign,
      [contact.id]: contact,
    },
    theme: { palette: "slate", typography: "inter" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    _pageIds: { home: home.id, about: about.id, services: services.id, webDesign: webDesign.id, contact: contact.id },
  };

  return site;
}

describe("site utils", () => {
  describe("getPagePath", () => {
    it("returns / for root page", () => {
      const site = createTestSite();
      const path = getPagePath(site, site._pageIds.home);
      expect(path).toBe("/");
    });

    it("returns correct path for top-level page", () => {
      const site = createTestSite();
      const path = getPagePath(site, site._pageIds.about);
      expect(path).toBe("/about");
    });

    it("returns correct path for nested page", () => {
      const site = createTestSite();
      const path = getPagePath(site, site._pageIds.webDesign);
      expect(path).toBe("/services/web-design");
    });

    it("returns null for non-existent page", () => {
      const site = createTestSite();
      const path = getPagePath(site, "non-existent-id");
      expect(path).toBeNull();
    });
  });

  describe("getPageByPath", () => {
    it("finds root page", () => {
      const site = createTestSite();
      const page = getPageByPath(site, "/");
      expect(page?.meta.title).toBe("Home");
    });

    it("finds top-level page", () => {
      const site = createTestSite();
      const page = getPageByPath(site, "/about");
      expect(page?.meta.title).toBe("About");
    });

    it("finds nested page", () => {
      const site = createTestSite();
      const page = getPageByPath(site, "/services/web-design");
      expect(page?.meta.title).toBe("Web Design");
    });

    it("returns null for non-existent path", () => {
      const site = createTestSite();
      const page = getPageByPath(site, "/non-existent");
      expect(page).toBeNull();
    });

    it("handles trailing slash", () => {
      const site = createTestSite();
      const page = getPageByPath(site, "/about/");
      expect(page?.meta.title).toBe("About");
    });
  });

  describe("getPagesFlattened", () => {
    it("returns all pages in tree order with depth", () => {
      const site = createTestSite();
      const flattened = getPagesFlattened(site);

      expect(flattened).toHaveLength(5);
      expect(flattened[0]).toMatchObject({ path: "/", depth: 0 });
      expect(flattened[1]).toMatchObject({ path: "/about", depth: 0 });
      expect(flattened[2]).toMatchObject({ path: "/services", depth: 0 });
      expect(flattened[3]).toMatchObject({ path: "/services/web-design", depth: 1 });
      expect(flattened[4]).toMatchObject({ path: "/contact", depth: 0 });
    });

    it("returns empty array for empty site", () => {
      const site = createSite("Empty");
      const flattened = getPagesFlattened(site);
      expect(flattened).toEqual([]);
    });
  });

  describe("getPageDescendants", () => {
    it("returns all descendants of a page", () => {
      const site = createTestSite();
      const descendants = getPageDescendants(site, site._pageIds.services);

      expect(descendants).toHaveLength(1);
      expect(descendants[0]?.meta.title).toBe("Web Design");
    });

    it("returns empty array for page with no children", () => {
      const site = createTestSite();
      const descendants = getPageDescendants(site, site._pageIds.about);
      expect(descendants).toEqual([]);
    });
  });

  describe("pathExists", () => {
    it("returns true for existing paths", () => {
      const site = createTestSite();
      expect(pathExists(site, "/")).toBe(true);
      expect(pathExists(site, "/about")).toBe(true);
      expect(pathExists(site, "/services/web-design")).toBe(true);
    });

    it("returns false for non-existent paths", () => {
      const site = createTestSite();
      expect(pathExists(site, "/blog")).toBe(false);
      expect(pathExists(site, "/services/seo")).toBe(false);
    });
  });

  describe("addPage", () => {
    it("adds page to site", () => {
      const site = createTestSite();
      const blog = createPage({ slug: "blog", meta: { title: "Blog" }, parentId: null, order: 4 });

      const updated = addPage(site, blog);

      expect(updated.pages[blog.id]).toBeDefined();
      expect(getPagePath(updated, blog.id)).toBe("/blog");
    });

    it("adds nested page", () => {
      const site = createTestSite();
      const seo = createPage({ slug: "seo", meta: { title: "SEO" }, parentId: site._pageIds.services, order: 1 });

      const updated = addPage(site, seo);

      expect(updated.pages[seo.id]).toBeDefined();
      expect(getPagePath(updated, seo.id)).toBe("/services/seo");
    });

    it("updates updatedAt timestamp", () => {
      const site = createTestSite();
      const blog = createPage({ slug: "blog", meta: { title: "Blog" }, parentId: null, order: 4 });

      const updated = addPage(site, blog);

      expect(updated.updatedAt).not.toBe(site.updatedAt);
    });
  });

  describe("removePage", () => {
    it("removes page from pages record", () => {
      const site = createTestSite();
      const aboutId = site._pageIds.about;

      const updated = removePage(site, aboutId);

      expect(updated.pages[aboutId]).toBeUndefined();
      expect(pathExists(updated, "/about")).toBe(false);
    });

    it("cascade deletes children", () => {
      const site = createTestSite();
      const servicesId = site._pageIds.services;
      const webDesignId = site._pageIds.webDesign;

      const updated = removePage(site, servicesId);

      expect(updated.pages[servicesId]).toBeUndefined();
      expect(updated.pages[webDesignId]).toBeUndefined();
      expect(pathExists(updated, "/services")).toBe(false);
      expect(pathExists(updated, "/services/web-design")).toBe(false);
    });

    it("handles non-existent page gracefully", () => {
      const site = createTestSite();
      const updated = removePage(site, "non-existent");

      expect(Object.keys(updated.pages)).toHaveLength(5);
    });
  });

  describe("movePage", () => {
    it("moves page to root level", () => {
      const site = createTestSite();
      const webDesignId = site._pageIds.webDesign;

      const updated = movePage(site, webDesignId, null);

      expect(getPagePath(updated, webDesignId)).toBe("/web-design");
      expect(updated.pages[webDesignId]?.parentId).toBeNull();
    });

    it("moves page under different parent", () => {
      const site = createTestSite();
      const contactId = site._pageIds.contact;
      const aboutId = site._pageIds.about;

      const updated = movePage(site, contactId, aboutId);

      expect(getPagePath(updated, contactId)).toBe("/about/contact");
      expect(updated.pages[contactId]?.parentId).toBe(aboutId);
    });

    it("handles non-existent page gracefully", () => {
      const site = createTestSite();
      const updated = movePage(site, "non-existent", site._pageIds.about);

      expect(updated).toEqual(site);
    });
  });

  describe("createSite", () => {
    it("creates empty site", () => {
      const site = createSite("My Site");

      expect(site.name).toBe("My Site");
      expect(site.pages).toEqual({});
      expect(site.id).toBeDefined();
    });

    it("creates site with initial page", () => {
      const home = createPage({ slug: "/", meta: { title: "Home" }, parentId: null, order: 0 });
      const site = createSite("My Site", home);

      expect(site.pages[home.id]).toBe(home);
    });
  });
});
