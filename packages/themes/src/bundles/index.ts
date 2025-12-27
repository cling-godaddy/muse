export * from "./types";
export { terminal as terminalBundle } from "./terminal";
export { synthwave as synthwaveBundle } from "./synthwave";
export { bubblegum as bubblegumBundle } from "./bubblegum";

import { terminal } from "./terminal";
import { synthwave } from "./synthwave";
import { bubblegum } from "./bubblegum";
import type { ThemeBundle } from "./types";

export const bundles = {
  terminal,
  synthwave,
  bubblegum,
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
