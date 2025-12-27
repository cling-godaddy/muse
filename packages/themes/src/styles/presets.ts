import type { StylePreset } from "./types";

export const rounded: StylePreset = {
  id: "rounded",
  name: "Rounded",
  description: "Modern and approachable with soft corners",
  spacing: {
    blockPadding: "3rem 2rem",
    sectionGap: "0",
  },
  borders: {
    radius: "0.75rem",
    radiusLarge: "0",
  },
  shadows: {
    card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    elevated: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
  },
};

export const sharp: StylePreset = {
  id: "sharp",
  name: "Sharp",
  description: "Crisp edges with no border radius",
  spacing: {
    blockPadding: "3rem 2rem",
    sectionGap: "0",
  },
  borders: {
    radius: "0",
    radiusLarge: "0",
  },
  shadows: {
    card: "0 1px 3px rgba(0, 0, 0, 0.12)",
    elevated: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
};

export const minimal: StylePreset = {
  id: "minimal",
  name: "Minimal",
  description: "Subtle shadows and clean lines",
  spacing: {
    blockPadding: "2.5rem 1.5rem",
    sectionGap: "3rem",
  },
  borders: {
    radius: "0.25rem",
    radiusLarge: "0.5rem",
  },
  shadows: {
    card: "0 1px 2px rgba(0, 0, 0, 0.05)",
    elevated: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
};

export const elevated: StylePreset = {
  id: "elevated",
  name: "Elevated",
  description: "Strong shadows for floating card effect",
  spacing: {
    blockPadding: "3rem 2rem",
    sectionGap: "5rem",
  },
  borders: {
    radius: "1rem",
    radiusLarge: "2rem",
  },
  shadows: {
    card: "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
    elevated: "0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)",
  },
};

export const cozy: StylePreset = {
  id: "cozy",
  name: "Cozy",
  description: "Extra generous padding for a warm feel",
  spacing: {
    blockPadding: "4rem 3rem",
    sectionGap: "6rem",
  },
  borders: {
    radius: "1rem",
    radiusLarge: "1.5rem",
  },
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.08)",
    elevated: "0 12px 32px rgba(0, 0, 0, 0.12)",
  },
};

export const compact: StylePreset = {
  id: "compact",
  name: "Compact",
  description: "Tighter spacing for dense content",
  spacing: {
    blockPadding: "2rem 1.5rem",
    sectionGap: "2.5rem",
  },
  borders: {
    radius: "0.5rem",
    radiusLarge: "0.75rem",
  },
  shadows: {
    card: "0 1px 2px rgba(0, 0, 0, 0.08)",
    elevated: "0 6px 16px rgba(0, 0, 0, 0.1)",
  },
};

export const stylePresets: StylePreset[] = [
  rounded,
  sharp,
  minimal,
  elevated,
  cozy,
  compact,
];
