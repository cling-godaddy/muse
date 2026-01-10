import type { Theme } from "./types";
import { resolveThemeColors } from "./colors";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || result.length < 4) return "0, 0, 0";
  const r = parseInt(result[1] ?? "0", 16);
  const g = parseInt(result[2] ?? "0", 16);
  const b = parseInt(result[3] ?? "0", 16);
  return `${r}, ${g}, ${b}`;
}

export function themeToCssVars(theme: Theme): Record<string, string> {
  const colors = resolveThemeColors(theme.colors);

  return {
    "--muse-theme-primary": colors.primary,
    "--muse-theme-primary-rgb": hexToRgb(colors.primary),
    "--muse-theme-primary-hover": colors.primaryHover,
    "--muse-theme-accent": colors.accent,
    "--muse-theme-bg": colors.background,
    "--muse-theme-bg-alt": colors.backgroundAlt,
    "--muse-theme-text": colors.text,
    "--muse-theme-text-muted": colors.textMuted,
    "--muse-theme-on-primary": colors.onPrimary,
    "--muse-theme-hero-gradient": colors.heroGradient,
    "--muse-theme-hero-text": colors.heroText,
    "--muse-theme-hero-text-muted": colors.heroTextMuted,
    "--muse-theme-cta-bg": colors.ctaBackground,
    "--muse-theme-cta-text": colors.ctaText,
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
