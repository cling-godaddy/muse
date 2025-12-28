import chroma from "chroma-js";

export function getColorStyle(colorName: string): { bg: string, text: string } | null {
  try {
    const color = chroma(colorName);
    const luminance = color.luminance();
    const text = luminance < 0.5 ? "#fff" : "#000";
    return { bg: color.hex(), text };
  }
  catch {
    return null;
  }
}
