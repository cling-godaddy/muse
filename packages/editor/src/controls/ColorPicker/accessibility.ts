import chroma from "chroma-js";

export const CONTRAST_AA_NORMAL = 4.5;
export const CONTRAST_AA_LARGE = 3;

const curveCache = new Map<string, number[]>();

/**
 * Get WCAG contrast ratio between two colors.
 * Returns a value from 1 (no contrast) to 21 (max contrast).
 */
export function getContrastRatio(color1: string, color2: string): number {
  return chroma.contrast(color1, color2);
}

/**
 * Check if foreground/background meet a contrast threshold.
 */
export function meetsContrastThreshold(
  foreground: string,
  background: string,
  threshold = CONTRAST_AA_NORMAL,
): boolean {
  return getContrastRatio(foreground, background) >= threshold;
}

/**
 * Euclidean distance squared in saturation/value space.
 */
function hsvDistance(s1: number, v1: number, s2: number, v2: number): number {
  return (s1 - s2) ** 2 + (v1 - v2) ** 2;
}

/**
 * For a given saturation, find the value (brightness) where contrast crosses the threshold.
 * Searches from initialValue upward.
 */
function findThreshold(
  background: string,
  hue: number,
  saturation: number,
  initialValue: number,
  threshold: number,
  isBackgroundLight: boolean,
): number | null {
  for (let value = initialValue; value <= 100; value++) {
    const testColor = chroma.hsv(hue, saturation / 100, value / 100).hex();
    const ratio = chroma.contrast(background, testColor);

    if (isBackgroundLight) {
      // on light backgrounds, we need dark colors (low value won't meet threshold)
      // as value increases from 0, contrast decreases
      // we're looking for where it drops below threshold
      if (ratio < threshold) {
        return value > 0 ? value - 1 : null;
      }
    }
    else {
      // on dark backgrounds, we need light colors (high value)
      // as value increases from 0, contrast increases
      // we're looking for where it meets threshold
      if (ratio >= threshold) {
        return value;
      }
    }
  }
  return null;
}

/**
 * Build an accessibility curve for a given background, hue, and threshold.
 * Returns an array where index = saturation (0-100) and value = the brightness
 * threshold where the contrast requirement is met/crossed.
 *
 * For light backgrounds: values above the curve are inaccessible (too light)
 * For dark backgrounds: values below the curve are inaccessible (too dark)
 */
export function getAccessibilityCurve(
  background: string,
  hue: number,
  threshold: number,
): number[] {
  const cacheKey = `${background}-${hue}-${threshold}`;
  const cached = curveCache.get(cacheKey);
  if (cached) return cached;

  const curve: number[] = [];
  const isBackgroundLight = chroma(background).luminance() > 0.5;

  // find initial threshold at saturation = 0
  const initialThreshold = findThreshold(
    background,
    hue,
    0,
    isBackgroundLight ? 0 : 0, // search from 0 upward in both cases
    threshold,
    isBackgroundLight,
  );

  if (initialThreshold === null) {
    // no accessible colors exist for this hue
    curveCache.set(cacheKey, []);
    return [];
  }

  curve.push(initialThreshold);

  // build the rest of the curve, using previous value as starting point
  for (let saturation = 1; saturation <= 100; saturation++) {
    const prevValue = curve[saturation - 1] ?? 0;
    const curveValue = findThreshold(
      background,
      hue,
      saturation,
      Math.max(0, prevValue - 5), // search slightly before previous to catch curve direction changes
      threshold,
      isBackgroundLight,
    );

    if (curveValue === null) break;
    curve.push(curveValue);
  }

  curveCache.set(cacheKey, curve);
  return curve;
}

/**
 * Find the nearest accessible color to the given foreground, against a background.
 * Returns null if the foreground is already accessible.
 * Returns the adjusted hex color if adjustment is needed.
 */
export function getNearestAccessibleColor(
  foreground: string,
  background: string,
  threshold = CONTRAST_AA_NORMAL,
): string | null {
  // already accessible?
  if (meetsContrastThreshold(foreground, background, threshold)) {
    return null;
  }

  const [hue, sat, val] = chroma(foreground).hsv();
  const normalizedHue = isNaN(hue) ? 0 : hue;
  const satPercent = sat * 100;
  const valPercent = val * 100;

  const curve = getAccessibilityCurve(background, normalizedHue, threshold);

  if (curve.length === 0) {
    // no accessible colors for this hue - fall back to black or white
    const isBackgroundLight = chroma(background).luminance() > 0.5;
    return isBackgroundLight ? "#000000" : "#ffffff";
  }

  // find nearest point on the curve
  let nearestSat = 0;
  let nearestVal = curve[0] as number;
  let nearestDist = hsvDistance(satPercent, valPercent, 0, nearestVal);

  for (let s = 1; s < curve.length; s++) {
    const v = curve[s] as number;
    const dist = hsvDistance(satPercent, valPercent, s, v);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestSat = s;
      nearestVal = v;
    }
  }

  return chroma.hsv(normalizedHue, nearestSat / 100, nearestVal / 100).hex();
}

/**
 * Get multiple nearest accessible color suggestions.
 */
export function getNearestAccessibleColors(
  foreground: string,
  background: string,
  count: number,
  threshold = CONTRAST_AA_NORMAL,
): string[] {
  if (meetsContrastThreshold(foreground, background, threshold)) {
    return [foreground];
  }

  const [hue, sat, val] = chroma(foreground).hsv();
  const normalizedHue = isNaN(hue) ? 0 : hue;
  const satPercent = sat * 100;
  const valPercent = val * 100;

  const curve = getAccessibilityCurve(background, normalizedHue, threshold);

  if (curve.length === 0) {
    const isBackgroundLight = chroma(background).luminance() > 0.5;
    return [isBackgroundLight ? "#000000" : "#ffffff"];
  }

  // calculate distances for all curve points
  const distances = curve.map((v, s) => ({
    saturation: s,
    value: v,
    distance: hsvDistance(satPercent, valPercent, s, v),
  }));

  // sort by distance and take top N
  distances.sort((a, b) => a.distance - b.distance);

  return distances
    .slice(0, count)
    .map(d => chroma.hsv(normalizedHue, d.saturation / 100, d.value / 100).hex());
}
