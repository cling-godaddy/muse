import type { Theme } from "./types";
import { getPalette } from "./palettes";
import { slate } from "./palettes/presets";
import { getTypography } from "./typography";
import { inter } from "./typography/presets";
import { getStyle, DEFAULT_STYLE_ID } from "./styles";
import { rounded } from "./styles/presets";
import { composeTheme, type ThemeOverrides } from "./compose";

export interface ThemeConfig {
  palette: string
  typography: string
  style?: string
  overrides?: ThemeOverrides
}

export function resolveTheme(config: ThemeConfig): Theme {
  const palette = getPalette(config.palette) ?? slate;
  const typography = getTypography(config.typography) ?? inter;
  const style = getStyle(config.style ?? DEFAULT_STYLE_ID) ?? rounded;

  return composeTheme(palette, typography, style, config.overrides);
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
