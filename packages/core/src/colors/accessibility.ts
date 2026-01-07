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
 * For a given saturation, find the brightness boundary where contrast crosses the threshold.
 * Uses binary search since contrast is monotonic with brightness.
 *
 * For light backgrounds: returns max brightness that still meets threshold
 * For dark backgrounds: returns min brightness that meets threshold
 */
function findThreshold(
  background: string,
  hue: number,
  saturation: number,
  threshold: number,
  isBackgroundLight: boolean,
): number | null {
  const getContrast = (v: number) => {
    const color = chroma.hsv(hue, saturation / 100, v / 100).hex();
    return chroma.contrast(background, color);
  };

  if (isBackgroundLight) {
    // Need dark colors for contrast on light backgrounds
    // Contrast decreases as brightness increases
    // Find the highest brightness that still meets threshold
    if (getContrast(0) < threshold) {
      return null; // even black doesn't meet threshold
    }
    if (getContrast(100) >= threshold) {
      return 100; // even white meets threshold
    }

    let low = 0;
    let high = 100;
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (getContrast(mid) >= threshold) {
        low = mid;
      }
      else {
        high = mid;
      }
    }
    return low;
  }
  else {
    // Need light colors for contrast on dark backgrounds
    // Contrast increases as brightness increases
    // Find the lowest brightness that meets threshold
    if (getContrast(100) < threshold) {
      return null; // even white doesn't meet threshold
    }
    if (getContrast(0) >= threshold) {
      return 0; // even black meets threshold
    }

    let low = 0;
    let high = 100;
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (getContrast(mid) >= threshold) {
        high = mid;
      }
      else {
        low = mid;
      }
    }
    return high;
  }
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
  // quantize hue to integers for better cache hits
  const quantizedHue = Math.round(hue) % 360;
  const cacheKey = `${background}-${quantizedHue}-${threshold}`;
  const cached = curveCache.get(cacheKey);
  if (cached) return cached;

  const curve: number[] = [];
  const isBackgroundLight = chroma(background).luminance() > 0.5;

  // build curve for each saturation level
  for (let saturation = 0; saturation <= 100; saturation++) {
    const curveValue = findThreshold(
      background,
      quantizedHue,
      saturation,
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
 * Get multiple accessible color suggestions.
 *
 * @param spread - Step size in saturation units when sampling the curve:
 *   - 0 (default): Clustered mode, returns N closest points to original color
 *   - N: Sample every N saturation points along the curve (higher = more distinct colors)
 */
export function getNearestAccessibleColors(
  foreground: string,
  background: string,
  count: number,
  threshold = CONTRAST_AA_NORMAL,
  spread = 0,
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

  // Find the nearest point on the curve
  let nearestIdx = 0;
  let nearestDist = hsvDistance(satPercent, valPercent, 0, curve[0] as number);
  for (let s = 1; s < curve.length; s++) {
    const dist = hsvDistance(satPercent, valPercent, s, curve[s] as number);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestIdx = s;
    }
  }

  if (spread > 0 && curve.length > 1) {
    // Sample at intervals of `spread` saturation points, starting from nearest
    const sampled = new Set<number>([nearestIdx]);

    // Sample outward from nearest in both directions
    for (let offset = spread; sampled.size < count; offset += spread) {
      const lower = nearestIdx - offset;
      const upper = nearestIdx + offset;
      const addedAny = lower >= 0 || upper < curve.length;

      if (lower >= 0) sampled.add(lower);
      if (upper < curve.length) sampled.add(upper);

      // Stop if we've gone beyond the curve in both directions
      if (!addedAny) break;
    }

    // Sort by saturation, convert to hex
    const sorted = [...sampled].sort((a, b) => a - b).slice(0, count);
    return sorted.map(s =>
      chroma.hsv(normalizedHue, s / 100, (curve[s] as number) / 100).hex(),
    );
  }

  // Clustered mode: return N closest points
  const distances = curve.map((v, s) => ({
    saturation: s,
    value: v,
    distance: hsvDistance(satPercent, valPercent, s, v),
  }));
  distances.sort((a, b) => a.distance - b.distance);

  return distances
    .slice(0, count)
    .map(d => chroma.hsv(normalizedHue, d.saturation / 100, d.value / 100).hex());
}
