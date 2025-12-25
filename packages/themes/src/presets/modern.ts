import type { Theme } from "../types";

export const modern: Theme = {
  id: "modern",
  name: "Modern",
  description: "Clean, contemporary design with subtle gradients and smooth interactions",

  tags: ["tech", "startup", "saas", "innovation", "digital", "app"],
  industries: ["technology", "software", "fintech", "healthtech"],
  mood: "innovative",

  colors: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    accent: "#8b5cf6",
    background: "#ffffff",
    backgroundAlt: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    heroGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    ctaBackground: "#6366f1",
  },

  typography: {
    headingFont: "Inter, -apple-system, sans-serif",
    bodyFont: "Inter, -apple-system, sans-serif",
    headingWeight: 700,
  },

  spacing: {
    blockPadding: "4rem 2rem",
    sectionGap: "6rem",
  },

  borders: {
    radius: "0.75rem",
    radiusLarge: "1.5rem",
  },

  shadows: {
    card: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    elevated: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
};
