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

import "./presets";

export {
  modern,
  minimal,
  bold,
  corporate,
  playful,
} from "./presets";
