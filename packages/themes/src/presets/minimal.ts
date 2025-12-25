import type { Theme } from "../types";

export const minimal: Theme = {
  id: "minimal",
  name: "Minimal",
  description: "Simple, clean design with lots of whitespace and focus on content",

  tags: ["clean", "simple", "elegant", "portfolio", "agency", "design"],
  industries: ["design", "architecture", "photography", "consulting"],
  mood: "sophisticated",

  colors: {
    primary: "#0f172a",
    primaryHover: "#1e293b",
    accent: "#64748b",
    background: "#ffffff",
    backgroundAlt: "#fafafa",
    text: "#0f172a",
    textMuted: "#71717a",
    heroGradient: "none",
    ctaBackground: "#0f172a",
  },

  typography: {
    headingFont: "Georgia, Times, serif",
    bodyFont: "-apple-system, BlinkMacSystemFont, sans-serif",
    headingWeight: 400,
  },

  spacing: {
    blockPadding: "5rem 2rem",
    sectionGap: "8rem",
  },

  borders: {
    radius: "0",
    radiusLarge: "0",
  },

  shadows: {
    card: "none",
    elevated: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
};
