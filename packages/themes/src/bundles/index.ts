export * from "./types";
export { terminal as terminalBundle } from "./terminal";
export { synthwave as synthwaveBundle } from "./synthwave";

import { terminal } from "./terminal";
import { synthwave } from "./synthwave";
import type { ThemeBundle } from "./types";

export const bundles = {
  terminal,
  synthwave,
} as const;

export type BundleId = keyof typeof bundles;

export function getBundle(id: string): ThemeBundle | undefined {
  return bundles[id as BundleId];
}

export function getAllBundles(): ThemeBundle[] {
  return Object.values(bundles);
}

export function getBundleIds(): string[] {
  return Object.keys(bundles);
}
