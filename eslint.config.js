// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strict,
  stylistic.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/indent": ["error", 2],
    },
  },
  {
    // Context files export both Provider components and hooks - this is idiomatic React
    files: ["**/context/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Icon components may export utility functions alongside the component
    files: ["**/icons/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  storybook.configs["flat/recommended"]
);
