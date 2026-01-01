import { describe, expect, it } from "vitest";
import {
  isHeroBlock,
  isFeaturesBlock,
  isCtaBlock,
  type Block,
} from "../../src/blocks/types";

describe("block type guards", () => {
  const heroBlock: Block = { id: "1", type: "hero", headline: "Welcome" };
  const featuresBlock: Block = {
    id: "2",
    type: "features",
    items: [{ title: "Fast", description: "Very fast" }],
  };
  const ctaBlock: Block = {
    id: "3",
    type: "cta",
    headline: "Get started",
    buttonText: "Sign up",
    buttonHref: "/signup",
  };

  describe("isHeroBlock", () => {
    it("returns true for hero blocks", () => {
      expect(isHeroBlock(heroBlock)).toBe(true);
    });

    it("returns false for other blocks", () => {
      expect(isHeroBlock(featuresBlock)).toBe(false);
      expect(isHeroBlock(ctaBlock)).toBe(false);
    });
  });

  describe("isFeaturesBlock", () => {
    it("returns true for features blocks", () => {
      expect(isFeaturesBlock(featuresBlock)).toBe(true);
    });

    it("returns false for other blocks", () => {
      expect(isFeaturesBlock(heroBlock)).toBe(false);
      expect(isFeaturesBlock(ctaBlock)).toBe(false);
    });
  });

  describe("isCtaBlock", () => {
    it("returns true for cta blocks", () => {
      expect(isCtaBlock(ctaBlock)).toBe(true);
    });

    it("returns false for other blocks", () => {
      expect(isCtaBlock(heroBlock)).toBe(false);
      expect(isCtaBlock(featuresBlock)).toBe(false);
    });
  });
});
