import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./packages/core/vitest.config.ts",
    test: { root: "./packages/core" },
  },
  {
    extends: "./packages/editor/vitest.config.ts",
    test: { root: "./packages/editor" },
  },
  {
    extends: "./packages/ai/vitest.config.ts",
    test: { root: "./packages/ai" },
  },
  // Lab excluded - Storybook browser tests hang with @vitest/browser-playwright
  // Run manually with: pnpm --filter @muse/lab dev
]);
