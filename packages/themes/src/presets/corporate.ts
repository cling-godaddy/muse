import type { Theme } from "../types";

export const corporate: Theme = {
  id: "corporate",
  name: "Corporate",
  description: "Professional, trustworthy design with conservative colors and classic typography",

  tags: ["professional", "trust", "business", "reliable", "established", "authority"],
  industries: ["legal", "finance", "healthcare", "insurance", "consulting", "enterprise"],
  mood: "trustworthy",

  colors: {
    primary: "#1e40af",
    primaryHover: "#1e3a8a",
    accent: "#0369a1",
    background: "#ffffff",
    backgroundAlt: "#f1f5f9",
    text: "#1e293b",
    textMuted: "#475569",
    heroGradient: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
    ctaBackground: "#1e40af",
  },

  typography: {
    headingFont: "Georgia, Times New Roman, serif",
    bodyFont: "-apple-system, BlinkMacSystemFont, sans-serif",
    headingWeight: 600,
  },

  spacing: {
    blockPadding: "4rem 2rem",
    sectionGap: "5rem",
  },

  borders: {
    radius: "0.375rem",
    radiusLarge: "0.5rem",
  },

  shadows: {
    card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    elevated: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
};
