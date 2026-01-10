import type { Theme } from "./types";

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
    "--muse-theme-hero-text": theme.colors.heroText ?? "#ffffff",
    "--muse-theme-hero-text-muted": theme.colors.heroTextMuted ?? "rgba(255, 255, 255, 0.9)",
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
