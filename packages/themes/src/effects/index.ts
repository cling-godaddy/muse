export * from "./types";
export * from "./presets";

import { effectsPresets, type EffectsId } from "./presets";
import type { Effects } from "./types";

export function getEffects(id: string): Effects | undefined {
  return effectsPresets[id as EffectsId];
}

export function getAllEffects(): Effects[] {
  return Object.values(effectsPresets);
}

export function getEffectsIds(): string[] {
  return Object.keys(effectsPresets);
}
