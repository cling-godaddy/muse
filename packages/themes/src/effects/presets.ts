import type { Effects } from "./types";

export const neutral: Effects = {
  id: "neutral",
  name: "Neutral",
  description: "No special visual effects",
};

export const crt: Effects = {
  id: "crt",
  name: "CRT",
  description: "Scanlines, glow, retro monitor aesthetic",
};

export const neon: Effects = {
  id: "neon",
  name: "Neon",
  description: "Glowing text and elements, retro-futuristic aesthetic",
};

export const effectsPresets = {
  neutral,
  crt,
  neon,
} as const;

export type EffectsId = keyof typeof effectsPresets;
