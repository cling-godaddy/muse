import chroma from "chroma-js";

// Override specific color names that chroma-js doesn't handle well
const COLOR_OVERRIDES: Record<string, string> = {
  golden: "#d4a017",
  brown: "#8b4513",
  orange: "#e65c00",
};

export function getColorStyle(colorName: string): { bg: string, text: string } | null {
  try {
    const hex = COLOR_OVERRIDES[colorName.toLowerCase()];
    const color = hex ? chroma(hex) : chroma(colorName);
    const luminance = color.luminance();
    const text = luminance < 0.5 ? "#fff" : "#000";
    return { bg: color.hex(), text };
  }
  catch {
    return null;
  }
}
