export type {
  Theme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorders,
  ThemeShadows,
} from "./types";

export {
  registerTheme,
  getTheme,
  getAllThemes,
  getThemeIds,
} from "./registry";

export { generateThemePrompt, generatePaletteTypographyPrompt } from "./ai";

export { themeToCssVars, themeToCssString } from "./css";

// legacy theme presets (keep for backward compat)
import "./presets";

export {
  modern,
  minimal,
  bold,
  corporate,
  playful,
} from "./presets";

// new palette system
export * from "./palettes";

// new typography system
export * from "./typography";

// new styles system
export * from "./styles";

// effects system
export * from "./effects";

// theme bundles
export * from "./bundles";

// composition
export { composeTheme, type ThemeOverrides } from "./compose";
export {
  resolveTheme,
  resolveThemeFromSelection,
  resolveThemeWithEffects,
  resolveThemeFromBundle,
  resolveLayeredTheme,
  type ThemeConfig,
  type ResolvedTheme,
  type LayeredThemeConfig,
} from "./resolve";

// font loading
export { loadFonts, buildGoogleFontsUrl } from "./fonts";
