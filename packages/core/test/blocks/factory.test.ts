import { describe, expect, it } from "vitest";
import { createBlock } from "../../src/blocks/factory";
import type { TextBlock, HeroBlock, FeaturesBlock, CtaBlock } from "../../src/blocks/types";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("createBlock", () => {
  it("creates block with valid UUID", () => {
    const block = createBlock<TextBlock>("text", { content: "hello" });
    expect(block.id).toMatch(uuidRegex);
  });

  it("sets type correctly", () => {
    const block = createBlock<TextBlock>("text", { content: "hello" });
    expect(block.type).toBe("text");
  });

  it("spreads data correctly", () => {
    const block = createBlock<TextBlock>("text", { content: "hello" });
    expect(block.content).toBe("hello");
  });

  it("generates unique IDs for each call", () => {
    const block1 = createBlock<TextBlock>("text", { content: "a" });
    const block2 = createBlock<TextBlock>("text", { content: "b" });
    expect(block1.id).not.toBe(block2.id);
  });

  describe("works with all block types", () => {
    it("creates text block", () => {
      const block = createBlock<TextBlock>("text", { content: "test" });
      expect(block.type).toBe("text");
      expect(block.content).toBe("test");
    });

    it("creates hero block", () => {
      const block = createBlock<HeroBlock>("hero", {
        headline: "Welcome",
        subheadline: "Subtitle",
      });
      expect(block.type).toBe("hero");
      expect(block.headline).toBe("Welcome");
      expect(block.subheadline).toBe("Subtitle");
    });

    it("creates features block", () => {
      const block = createBlock<FeaturesBlock>("features", {
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 3,
      });
      expect(block.type).toBe("features");
      expect(block.items).toHaveLength(1);
      expect(block.columns).toBe(3);
    });

    it("creates cta block", () => {
      const block = createBlock<CtaBlock>("cta", {
        headline: "Get started",
        buttonText: "Sign up",
        buttonHref: "/signup",
        variant: "primary",
      });
      expect(block.type).toBe("cta");
      expect(block.headline).toBe("Get started");
      expect(block.variant).toBe("primary");
    });
  });
});
