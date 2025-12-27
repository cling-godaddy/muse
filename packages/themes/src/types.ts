export interface ThemeColors {
  primary: string
  primaryHover: string
  accent: string
  background: string
  backgroundAlt: string
  text: string
  textMuted: string
  heroGradient?: string
  ctaBackground?: string
  ctaText?: string
}

export interface ThemeTypography {
  headingFont: string
  bodyFont: string
  headingWeight: number
}

export interface ThemeSpacing {
  blockPadding: string
  sectionGap: string
}

export interface ThemeBorders {
  radius: string
  radiusLarge: string
}

export interface ThemeShadows {
  card: string
  elevated: string
}

export interface Theme {
  id: string
  name: string
  description: string

  tags: string[]
  industries: string[]
  mood: string

  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borders: ThemeBorders
  shadows: ThemeShadows
}
