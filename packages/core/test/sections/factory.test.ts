import { describe, expect, it } from "vitest";
import { createSection } from "../../src/sections/factory";
import type { HeroSection, FeaturesSection, CtaSection } from "../../src/sections/types";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("createSection", () => {
  it("creates section with valid UUID", () => {
    const section = createSection<HeroSection>("hero", { headline: "Hello" });
    expect(section.id).toMatch(uuidRegex);
  });

  it("sets type correctly", () => {
    const section = createSection<HeroSection>("hero", { headline: "Hello" });
    expect(section.type).toBe("hero");
  });

  it("spreads data correctly", () => {
    const section = createSection<HeroSection>("hero", { headline: "Hello" });
    expect(section.headline).toBe("Hello");
  });

  it("generates unique IDs for each call", () => {
    const section1 = createSection<HeroSection>("hero", { headline: "a" });
    const section2 = createSection<HeroSection>("hero", { headline: "b" });
    expect(section1.id).not.toBe(section2.id);
  });

  describe("works with all section types", () => {
    it("creates hero section", () => {
      const section = createSection<HeroSection>("hero", {
        headline: "Welcome",
        subheadline: "Subtitle",
      });
      expect(section.type).toBe("hero");
      expect(section.headline).toBe("Welcome");
      expect(section.subheadline).toBe("Subtitle");
    });

    it("creates features section", () => {
      const section = createSection<FeaturesSection>("features", {
        items: [{ title: "Fast", description: "Very fast" }],
        columns: 3,
      });
      expect(section.type).toBe("features");
      expect(section.items).toHaveLength(1);
      expect(section.columns).toBe(3);
    });

    it("creates cta section", () => {
      const section = createSection<CtaSection>("cta", {
        headline: "Get started",
        buttonText: "Sign up",
        buttonHref: "/signup",
        variant: "primary",
      });
      expect(section.type).toBe("cta");
      expect(section.headline).toBe("Get started");
      expect(section.variant).toBe("primary");
    });
  });
});
