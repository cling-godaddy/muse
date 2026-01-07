import chroma from "chroma-js";

export interface HSV {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
}

export interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export function hexToHsv(hex: string): HSV {
  const [h, s, v] = chroma(hex).hsv();
  return {
    h: isNaN(h) ? 0 : h,
    s: s * 100,
    v: v * 100,
  };
}

export function hsvToHex(hsv: HSV): string {
  return chroma.hsv(hsv.h, hsv.s / 100, hsv.v / 100).hex();
}

export function hexToRgb(hex: string): RGB {
  const [r, g, b] = chroma(hex).rgb();
  return { r, g, b };
}

export function rgbToHex(rgb: RGB): string {
  return chroma(rgb.r, rgb.g, rgb.b).hex();
}

export function isValidHex(value: string): boolean {
  if (!/^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
    return false;
  }
  try {
    chroma(value);
    return true;
  }
  catch {
    return false;
  }
}

export function normalizeHex(value: string): string {
  try {
    return chroma(value).hex();
  }
  catch {
    return value;
  }
}

export function getContrastColor(hex: string): string {
  try {
    return chroma(hex).luminance() < 0.5 ? "#ffffff" : "#000000";
  }
  catch {
    return "#000000";
  }
}

export function hexToRgba(hex: string): RGB & { a: number } {
  const color = chroma(hex);
  const [r, g, b] = color.rgb();
  return { r, g, b, a: color.alpha() };
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  return chroma(r, g, b).alpha(a).hex("rgba");
}
