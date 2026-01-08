import { describe, it, expect } from "vitest";
import { extractCssVarFallback, resolveCssVar } from "./css";

describe("extractCssVarFallback", () => {
  it("extracts hex fallback from var() expression", () => {
    expect(extractCssVarFallback("var(--muse-theme-bg-alt, #f8fafc)")).toBe("#f8fafc");
  });

  it("extracts fallback with extra whitespace", () => {
    expect(extractCssVarFallback("var(--muse-theme-bg-alt,  #f8fafc )")).toBe("#f8fafc");
  });

  it("extracts rgb fallback", () => {
    expect(extractCssVarFallback("var(--some-color, rgb(255, 255, 255))")).toBe("rgb(255, 255, 255)");
  });

  it("returns null for var() without fallback", () => {
    expect(extractCssVarFallback("var(--muse-theme-bg-alt)")).toBe(null);
  });

  it("returns null for non-var strings", () => {
    expect(extractCssVarFallback("#f8fafc")).toBe(null);
    expect(extractCssVarFallback("rgb(255, 255, 255)")).toBe(null);
  });
});

describe("resolveCssVar", () => {
  const themeConfig = { palette: "slate", typography: "inter" };

  it("resolves --muse-theme-bg-alt to palette backgroundAlt", () => {
    const result = resolveCssVar("var(--muse-theme-bg-alt, #f8fafc)", themeConfig);
    expect(result).toBe("#f1f5f9"); // slate palette's backgroundAlt
  });

  it("resolves --muse-theme-bg to palette background", () => {
    const result = resolveCssVar("var(--muse-theme-bg, #000)", themeConfig);
    expect(result).toBe("#ffffff"); // slate palette's background
  });

  it("resolves --muse-theme-primary to palette primary", () => {
    const result = resolveCssVar("var(--muse-theme-primary, #000)", themeConfig);
    expect(result).toBe("#1e40af"); // slate palette's primary
  });

  it("returns null for unknown CSS variable", () => {
    const result = resolveCssVar("var(--unknown-var, #f8fafc)", themeConfig);
    expect(result).toBe(null);
  });

  it("returns null for non-var strings", () => {
    expect(resolveCssVar("#f8fafc", themeConfig)).toBe(null);
  });

  it("works with different palettes", () => {
    const indigoConfig = { palette: "indigo", typography: "inter" };
    const result = resolveCssVar("var(--muse-theme-bg-alt, #000)", indigoConfig);
    expect(result).toBe("#f8fafc"); // indigo palette's backgroundAlt
  });
});
