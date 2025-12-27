import type { Theme } from "./types";
import { getPalette } from "./palettes";
import { slate } from "./palettes/presets";
import { getTypography } from "./typography";
import { inter } from "./typography/presets";
import { getStyle, DEFAULT_STYLE_ID } from "./styles";
import { rounded } from "./styles/presets";
import { getEffects } from "./effects";
import { neutral } from "./effects/presets";
import { getBundle } from "./bundles";
import { composeTheme, type ThemeOverrides } from "./compose";
import type { Effects } from "./effects/types";

export interface ThemeConfig {
  palette: string
  typography: string
  style?: string
  effects?: string
  overrides?: ThemeOverrides
}

export interface ResolvedTheme {
  theme: Theme
  effects: Effects
}

export function resolveTheme(config: ThemeConfig): Theme {
  const palette = getPalette(config.palette) ?? slate;
  const typography = getTypography(config.typography) ?? inter;
  const styleId = config.style ?? palette.defaultStyle ?? DEFAULT_STYLE_ID;
  const style = getStyle(styleId) ?? rounded;

  return composeTheme(palette, typography, style, config.overrides);
}

export function resolveThemeWithEffects(config: ThemeConfig): ResolvedTheme {
  const theme = resolveTheme(config);
  const effects = getEffects(config.effects ?? "neutral") ?? neutral;

  return { theme, effects };
}

export function resolveThemeFromSelection(
  paletteId: string,
  typographyId: string,
  styleId?: string,
): Theme {
  return resolveTheme({
    palette: paletteId,
    typography: typographyId,
    style: styleId,
  });
}

export function resolveThemeFromBundle(bundleId: string): ResolvedTheme | undefined {
  const bundle = getBundle(bundleId);
  if (!bundle) return undefined;

  return resolveThemeWithEffects({
    palette: bundle.palette,
    typography: bundle.typography,
    style: bundle.style,
    effects: bundle.effects,
  });
}
