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

export { generateThemePrompt } from "./ai";

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
