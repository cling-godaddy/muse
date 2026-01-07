import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@muse/core": path.resolve(__dirname, "../../packages/core/src"),
      "@muse/editor": path.resolve(__dirname, "../../packages/editor/src"),
      "@muse/themes": path.resolve(__dirname, "../../packages/themes/src"),
      "@muse/media": path.resolve(__dirname, "../../packages/media/src"),
      "@muse/ai": path.resolve(__dirname, "../../packages/ai/src"),
    },
  },
});
