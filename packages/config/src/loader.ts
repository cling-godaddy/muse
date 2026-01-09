import type { Environment } from "./types";

const ENVIRONMENTS: Environment[] = ["local", "development", "test", "production"];

export function isValidEnvironment(env: string): env is Environment {
  return ENVIRONMENTS.includes(env as Environment);
}

export function detectEnvironment(): Environment {
  // Check Node.js env first (works in API, tools, scripts)
  if (typeof process !== "undefined" && process.env) {
    // Explicit CONFIG_ENV takes precedence
    if (process.env.CONFIG_ENV && isValidEnvironment(process.env.CONFIG_ENV)) {
      return process.env.CONFIG_ENV;
    }

    // Fall back to NODE_ENV mapping
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "test") return "test";
    if (nodeEnv === "production") return "production";
    if (nodeEnv === "development") return "development";
  }

  // Check Vite env (browser - injected at build time)
  // Type assertion needed since ImportMeta.env is defined by consumer's vite-env.d.ts
  const viteEnv = (import.meta as { env?: { VITE_ENV?: string } }).env?.VITE_ENV;
  if (viteEnv && isValidEnvironment(viteEnv)) {
    return viteEnv;
  }

  return "local";
}
