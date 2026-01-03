import { describe, expect, it } from "vitest";
import {
  getPagePath,
  getPageByPath,
  getPagesFlattened,
  pathExists,
  addPage,
  removePage,
  movePage,
} from "../../src/site/utils";
import { createSite } from "../../src/site/types";
import { createPage } from "../../src/page/types";

function createTestSite() {
  const home = createPage("/", { title: "Home" });
  const about = createPage("about", { title: "About" });
  const services = createPage("services", { title: "Services" });
  const webDesign = createPage("web-design", { title: "Web Design" });
  const contact = createPage("contact", { title: "Contact" });

  return {
    id: "site-1",
    name: "Test Site",
    pages: {
      [home.id]: home,
      [about.id]: about,
      [services.id]: services,
      [webDesign.id]: webDesign,
      [contact.id]: contact,
    },
    tree: [
      { pageId: home.id, slug: "/", children: [] },
      { pageId: about.id, slug: "about", children: [] },
      {
        pageId: services.id,
        slug: "services",
        children: [
          { pageId: webDesign.id, slug: "web-design", children: [] },
        ],
      },
      { pageId: contact.id, slug: "contact", children: [] },
    ],
    theme: { palette: "slate", typography: "inter" },
    navbar: {},
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    _pageIds: { home: home.id, about: about.id, services: services.id, webDesign: webDesign.id, contact: contact.id },
  };
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
    it("adds page to root level", () => {
      const site = createTestSite();
      const blog = createPage("blog", { title: "Blog" });

      const updated = addPage(site, blog);

      expect(updated.pages[blog.id]).toBeDefined();
      expect(updated.tree).toHaveLength(5);
      expect(getPagePath(updated, blog.id)).toBe("/blog");
    });

    it("adds page as child of existing page", () => {
      const site = createTestSite();
      const seo = createPage("seo", { title: "SEO" });

      const updated = addPage(site, seo, "/services");

      expect(updated.pages[seo.id]).toBeDefined();
      expect(getPagePath(updated, seo.id)).toBe("/services/seo");
    });

    it("adds to root if parent path not found", () => {
      const site = createTestSite();
      const orphan = createPage("orphan", { title: "Orphan" });

      const updated = addPage(site, orphan, "/non-existent");

      expect(getPagePath(updated, orphan.id)).toBe("/orphan");
    });

    it("updates updatedAt timestamp", () => {
      const site = createTestSite();
      const blog = createPage("blog", { title: "Blog" });

      const updated = addPage(site, blog);

      expect(updated.updatedAt).not.toBe(site.updatedAt);
    });
  });

  describe("removePage", () => {
    it("removes page from tree and pages record", () => {
      const site = createTestSite();
      const aboutId = site._pageIds.about;

      const updated = removePage(site, aboutId);

      expect(updated.pages[aboutId]).toBeUndefined();
      expect(pathExists(updated, "/about")).toBe(false);
      expect(updated.tree).toHaveLength(3);
    });

    it("removes nested page", () => {
      const site = createTestSite();
      const webDesignId = site._pageIds.webDesign;

      const updated = removePage(site, webDesignId);

      expect(updated.pages[webDesignId]).toBeUndefined();
      expect(pathExists(updated, "/services/web-design")).toBe(false);
      // Services should still exist
      expect(pathExists(updated, "/services")).toBe(true);
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

      const updated = movePage(site, webDesignId, undefined);

      expect(getPagePath(updated, webDesignId)).toBe("/web-design");
    });

    it("moves page under different parent", () => {
      const site = createTestSite();
      const contactId = site._pageIds.contact;

      const updated = movePage(site, contactId, "/about");

      expect(getPagePath(updated, contactId)).toBe("/about/contact");
    });

    it("handles non-existent page gracefully", () => {
      const site = createTestSite();
      const updated = movePage(site, "non-existent", "/about");

      expect(updated).toEqual(site);
    });
  });

  describe("createSite", () => {
    it("creates empty site", () => {
      const site = createSite("My Site");

      expect(site.name).toBe("My Site");
      expect(site.pages).toEqual({});
      expect(site.tree).toEqual([]);
      expect(site.id).toBeDefined();
    });

    it("creates site with initial page", () => {
      const home = createPage("/", { title: "Home" });
      const site = createSite("My Site", home);

      expect(site.pages[home.id]).toBe(home);
      expect(site.tree).toHaveLength(1);
      expect(site.tree[0].pageId).toBe(home.id);
    });
  });
});
