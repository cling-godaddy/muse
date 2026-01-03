import { describe, expect, it } from "vitest";
import { parseSitemap } from "../../src/agents/sitemap";

describe("sitemap agent", () => {
  describe("parseSitemap", () => {
    it("parses valid sitemap JSON", () => {
      const json = JSON.stringify({
        pages: [
          { slug: "/", title: "Home", purpose: "Main landing", priority: "primary" },
          { slug: "/about", title: "About", purpose: "Company info", priority: "secondary" },
          {
            slug: "/services/web-design",
            title: "Web Design",
            purpose: "Service details",
            priority: "secondary",
            suggestedSections: ["hero", "features", "pricing"],
          },
        ],
      });

      const result = parseSitemap(json);

      expect(result.pages).toHaveLength(3);
      expect(result.pages[0]).toEqual({
        slug: "/",
        title: "Home",
        purpose: "Main landing",
        priority: "primary",
        suggestedSections: undefined,
      });
      expect(result.pages[2].suggestedSections).toEqual(["hero", "features", "pricing"]);
    });

    it("normalizes priority to primary/secondary", () => {
      const json = JSON.stringify({
        pages: [
          { slug: "/", title: "Home", purpose: "Main", priority: "primary" },
          { slug: "/about", title: "About", purpose: "Info", priority: "secondary" },
          { slug: "/contact", title: "Contact", purpose: "Form", priority: "unknown" },
        ],
      });

      const result = parseSitemap(json);

      expect(result.pages[0].priority).toBe("primary");
      expect(result.pages[1].priority).toBe("secondary");
      expect(result.pages[2].priority).toBe("primary"); // defaults to primary
    });

    it("handles missing fields with defaults", () => {
      const json = JSON.stringify({
        pages: [
          { slug: "/about" },
          {},
        ],
      });

      const result = parseSitemap(json);

      expect(result.pages[0].slug).toBe("/about");
      expect(result.pages[0].title).toBe("Untitled");
      expect(result.pages[0].purpose).toBe("");
      expect(result.pages[1].slug).toBe("/");
    });

    it("returns fallback on invalid JSON", () => {
      const result = parseSitemap("not valid json");

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].slug).toBe("/");
      expect(result.pages[0].title).toBe("Home");
    });

    it("returns empty pages array when pages is missing", () => {
      const result = parseSitemap("{}");

      expect(result.pages).toHaveLength(0);
    });
  });
});
