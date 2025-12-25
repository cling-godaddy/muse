import type { Theme } from "./types";
import type { ColorPalette } from "./palettes/types";
import type { TypographyPreset } from "./typography/types";
import type { StylePreset } from "./styles/types";

export interface ThemeOverrides {
  colors?: Partial<Theme["colors"]>
  typography?: Partial<Theme["typography"]>
  spacing?: Partial<Theme["spacing"]>
  borders?: Partial<Theme["borders"]>
  shadows?: Partial<Theme["shadows"]>
}

export function composeTheme(
  palette: ColorPalette,
  typography: TypographyPreset,
  style: StylePreset,
  overrides?: ThemeOverrides,
): Theme {
  const theme: Theme = {
    id: `${palette.id}-${typography.id}-${style.id}`,
    name: `${palette.name} + ${typography.name}`,
    description: `${palette.description} with ${typography.description.toLowerCase()}`,

    tags: [...palette.tags, ...typography.tags],
    industries: palette.industries,
    mood: palette.mood,

    colors: {
      primary: palette.colors.primary,
      primaryHover: palette.colors.primaryHover,
      accent: palette.colors.accent,
      background: palette.colors.background,
      backgroundAlt: palette.colors.backgroundAlt,
      text: palette.colors.text,
      textMuted: palette.colors.textMuted,
      heroGradient: palette.colors.heroGradient,
      ctaBackground: palette.colors.ctaBackground,
      ...overrides?.colors,
    },

    typography: {
      headingFont: typography.fonts.heading,
      bodyFont: typography.fonts.body,
      headingWeight: typography.weights.heading,
      ...overrides?.typography,
    },

    spacing: {
      blockPadding: style.spacing.blockPadding,
      sectionGap: style.spacing.sectionGap,
      ...overrides?.spacing,
    },

    borders: {
      radius: style.borders.radius,
      radiusLarge: style.borders.radiusLarge,
      ...overrides?.borders,
    },

    shadows: {
      card: style.shadows.card,
      elevated: style.shadows.elevated,
      ...overrides?.shadows,
    },
  };

  return theme;
}
