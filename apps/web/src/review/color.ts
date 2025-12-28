import chroma from "chroma-js";

// Override specific color names that chroma-js doesn't handle well
const COLOR_OVERRIDES: Record<string, string> = {
  "brown": "#8b4513",
  "golden": "#d4a017",
  "light brown": "#c4a484",
  "orange": "#e65c00",
};

export function getColorStyle(colorName: string): { bg: string, text: string } | null {
  try {
    const normalized = colorName.trim().toLowerCase();
    const hex = COLOR_OVERRIDES[normalized];
    const color = hex ? chroma(hex) : chroma(normalized);
    const luminance = color.luminance();
    const text = luminance < 0.5 ? "#fff" : "#000";
    return { bg: color.hex(), text };
  }
  catch {
    return null;
  }
}
