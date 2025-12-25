import type { Theme } from "../types";

export const bold: Theme = {
  id: "bold",
  name: "Bold",
  description: "High contrast, impactful design with strong colors and dramatic typography",

  tags: ["creative", "entertainment", "bold", "energetic", "dynamic", "impact"],
  industries: ["media", "entertainment", "gaming", "sports", "music"],
  mood: "energetic",

  colors: {
    primary: "#dc2626",
    primaryHover: "#b91c1c",
    accent: "#fbbf24",
    background: "#0a0a0a",
    backgroundAlt: "#171717",
    text: "#fafafa",
    textMuted: "#a3a3a3",
    heroGradient: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
    ctaBackground: "#dc2626",
  },

  typography: {
    headingFont: "Impact, Haettenschweiler, sans-serif",
    bodyFont: "-apple-system, BlinkMacSystemFont, sans-serif",
    headingWeight: 900,
  },

  spacing: {
    blockPadding: "3rem 2rem",
    sectionGap: "4rem",
  },

  borders: {
    radius: "0.25rem",
    radiusLarge: "0.5rem",
  },

  shadows: {
    card: "0 0 0 1px rgb(255 255 255 / 0.1)",
    elevated: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
  },
};
