import type { Theme } from "../types";

export const playful: Theme = {
  id: "playful",
  name: "Playful",
  description: "Bright, fun design with vibrant colors and rounded shapes",

  tags: ["fun", "friendly", "casual", "youth", "creative", "colorful"],
  industries: ["consumer", "gaming", "education", "kids", "lifestyle", "food"],
  mood: "cheerful",

  colors: {
    primary: "#ec4899",
    primaryHover: "#db2777",
    accent: "#8b5cf6",
    background: "#fefce8",
    backgroundAlt: "#fef3c7",
    text: "#1c1917",
    textMuted: "#57534e",
    heroGradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)",
    ctaBackground: "#ec4899",
  },

  typography: {
    headingFont: "Nunito, Quicksand, sans-serif",
    bodyFont: "Nunito, -apple-system, sans-serif",
    headingWeight: 800,
  },

  spacing: {
    blockPadding: "3rem 2rem",
    sectionGap: "4rem",
  },

  borders: {
    radius: "1rem",
    radiusLarge: "2rem",
  },

  shadows: {
    card: "0 4px 14px 0 rgb(236 72 153 / 0.15)",
    elevated: "0 20px 40px -10px rgb(139 92 246 / 0.25)",
  },
};
