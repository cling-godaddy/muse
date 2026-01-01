import { describe, expect, it } from "vitest";
import {
  isHeroSection,
  isFeaturesSection,
  isCtaSection,
  type Section,
} from "../../src/sections/types";

describe("section type guards", () => {
  const heroSection: Section = { id: "1", type: "hero", headline: "Welcome" };
  const featuresSection: Section = {
    id: "2",
    type: "features",
    items: [{ title: "Fast", description: "Very fast" }],
  };
  const ctaSection: Section = {
    id: "3",
    type: "cta",
    headline: "Get started",
    buttonText: "Sign up",
    buttonHref: "/signup",
  };

  describe("isHeroSection", () => {
    it("returns true for hero sections", () => {
      expect(isHeroSection(heroSection)).toBe(true);
    });

    it("returns false for other sections", () => {
      expect(isHeroSection(featuresSection)).toBe(false);
      expect(isHeroSection(ctaSection)).toBe(false);
    });
  });

  describe("isFeaturesSection", () => {
    it("returns true for features sections", () => {
      expect(isFeaturesSection(featuresSection)).toBe(true);
    });

    it("returns false for other sections", () => {
      expect(isFeaturesSection(heroSection)).toBe(false);
      expect(isFeaturesSection(ctaSection)).toBe(false);
    });
  });

  describe("isCtaSection", () => {
    it("returns true for cta sections", () => {
      expect(isCtaSection(ctaSection)).toBe(true);
    });

    it("returns false for other sections", () => {
      expect(isCtaSection(heroSection)).toBe(false);
      expect(isCtaSection(featuresSection)).toBe(false);
    });
  });
});
