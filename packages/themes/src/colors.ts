import type { ThemeColors } from "./types";

/** Compute relative luminance (0-1) from hex color */
function getLuminance(hex: string): number {
  // Support both #RRGGBB and #RGB formats
  let match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) {
    // Try shorthand #RGB format
    const shortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shortMatch && shortMatch[1] && shortMatch[2] && shortMatch[3]) {
      // Expand shorthand to full hex
      const r = shortMatch[1] + shortMatch[1];
      const g = shortMatch[2] + shortMatch[2];
      const b = shortMatch[3] + shortMatch[3];
      match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(`#${r}${g}${b}`);
    }
  }

  if (!match) {
    console.warn(`Could not parse color: ${hex}`);
    return 0.5;
  }

  const values = [1, 2, 3].map((i) => {
    const hex = match[i];
    if (!hex) return 0;
    const val = parseInt(hex, 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  const [r = 0, g = 0, b = 0] = values;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Compute WCAG contrast ratio between two colors */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Auto-compute onPrimary based on contrast ratio if not provided */
function computeOnPrimary(primary: string): string {
  // Choose black or white based on which has higher contrast
  const whiteContrast = getContrastRatio(primary, "#ffffff");
  const blackContrast = getContrastRatio(primary, "#000000");
  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

/** Validate onPrimary works on both primary and primaryHover */
function validateThemeColors(colors: Required<ThemeColors>): void {
  const primaryContrast = getContrastRatio(colors.primary, colors.onPrimary);
  const hoverContrast = getContrastRatio(colors.primaryHover, colors.onPrimary);

  // WCAG AA requires 4.5:1 for normal text
  if (primaryContrast < 4.5) {
    console.warn(
      `Low contrast: onPrimary on primary (${primaryContrast.toFixed(2)}:1, WCAG AA requires 4.5:1)`,
    );
  }
  if (hoverContrast < 4.5) {
    console.warn(
      `Low contrast: onPrimary on primaryHover (${hoverContrast.toFixed(2)}:1, WCAG AA requires 4.5:1)`,
    );
  }
}

/** Resolve all color token defaults and cascades */
export function resolveThemeColors(
  colors: ThemeColors,
): Required<ThemeColors> {
  // Auto-compute onPrimary if missing
  const onPrimary = colors.onPrimary ?? computeOnPrimary(colors.primary);

  // Detect if heroGradient was explicitly provided (before defaulting)
  const hasCustomHeroGradient = colors.heroGradient != null;

  // Smart cascade for heroText:
  // - If custom heroGradient explicitly set, fall back to text color (not onPrimary)
  // - If no heroGradient (will use primary), fall back to onPrimary
  const heroText
    = colors.heroText ?? (hasCustomHeroGradient ? colors.text : onPrimary);

  // heroTextMuted always falls back to textMuted
  const heroTextMuted = colors.heroTextMuted ?? colors.textMuted;

  // CTA text cascades from onPrimary (ctaBackground often = primary)
  const ctaText = colors.ctaText ?? onPrimary;

  const resolved = {
    ...colors,
    onPrimary,
    heroGradient: colors.heroGradient ?? colors.primary,
    heroText,
    heroTextMuted,
    ctaBackground: colors.ctaBackground ?? colors.primary,
    ctaText,
  };

  // Validate colors
  validateThemeColors(resolved);

  return resolved;
}
