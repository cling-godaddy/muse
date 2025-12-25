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

// composition
export { composeTheme, type ThemeOverrides } from "./compose";
export { resolveTheme, resolveThemeFromSelection, type ThemeConfig } from "./resolve";
