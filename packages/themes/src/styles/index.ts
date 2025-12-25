export type { StylePreset } from "./types";
export {
  rounded,
  sharp,
  minimal,
  elevated,
  cozy,
  compact,
  stylePresets,
} from "./presets";

import { stylePresets } from "./presets";
import type { StylePreset } from "./types";

const styleMap = new Map<string, StylePreset>(
  stylePresets.map(s => [s.id, s]),
);

export function getStyle(id: string): StylePreset | undefined {
  return styleMap.get(id);
}

export function getAllStyles(): StylePreset[] {
  return stylePresets;
}

export function getStyleIds(): string[] {
  return stylePresets.map(s => s.id);
}

export const DEFAULT_STYLE_ID = "rounded";
