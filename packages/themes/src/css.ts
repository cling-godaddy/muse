import type { Theme } from "./types";
import { resolveTheme } from "./resolve";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || result.length < 4) return "0, 0, 0";
  const r = parseInt(result[1] ?? "0", 16);
  const g = parseInt(result[2] ?? "0", 16);
  const b = parseInt(result[3] ?? "0", 16);
  return `${r}, ${g}, ${b}`;
}

export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    "--muse-theme-primary": theme.colors.primary,
    "--muse-theme-primary-rgb": hexToRgb(theme.colors.primary),
    "--muse-theme-primary-hover": theme.colors.primaryHover,
    "--muse-theme-accent": theme.colors.accent,
    "--muse-theme-bg": theme.colors.background,
    "--muse-theme-bg-alt": theme.colors.backgroundAlt,
    "--muse-theme-text": theme.colors.text,
    "--muse-theme-text-muted": theme.colors.textMuted,
    "--muse-theme-hero-gradient": theme.colors.heroGradient ?? theme.colors.primary,
    "--muse-theme-cta-bg": theme.colors.ctaBackground ?? theme.colors.primary,
    "--muse-theme-cta-text": theme.colors.ctaText ?? "#ffffff",
    "--muse-theme-heading-font": theme.typography.headingFont,
    "--muse-theme-body-font": theme.typography.bodyFont,
    "--muse-theme-heading-weight": String(theme.typography.headingWeight),
    "--muse-theme-block-padding": theme.spacing.blockPadding,
    "--muse-theme-section-gap": theme.spacing.sectionGap,
    "--muse-theme-radius": theme.borders.radius,
    "--muse-theme-radius-lg": theme.borders.radiusLarge,
    "--muse-theme-shadow-card": theme.shadows.card,
    "--muse-theme-shadow-elevated": theme.shadows.elevated,
  };
}

export function themeToCssString(theme: Theme): string {
  const vars = themeToCssVars(theme);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
}

/**
 * Extract the fallback value from a CSS var() expression.
 * e.g., "var(--muse-theme-bg-alt, #f8fafc)" → "#f8fafc"
 */
export function extractCssVarFallback(varString: string): string | null {
  // Use .+ to capture fallback values that may contain parentheses (like rgb())
  const match = varString.match(/var\([^,]+,\s*(.+)\)$/);
  return match?.[1]?.trim() ?? null;
}

/**
 * Resolve a CSS var() expression to its actual value using the theme config.
 * e.g., "var(--muse-theme-bg-alt, #f8fafc)" with palette "indigo" → "#f8fafc"
 */
export function resolveCssVar(
  varString: string,
  themeConfig: { palette: string, typography: string },
): string | null {
  const match = varString.match(/var\((--[\w-]+)/);
  if (!match || !match[1]) return null;

  const varName = match[1];
  const theme = resolveTheme(themeConfig);
  const cssVars = themeToCssVars(theme);

  return cssVars[varName] ?? null;
}
