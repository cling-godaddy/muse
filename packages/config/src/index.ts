import type { Config, Environment } from "./types";
import { configs } from "./environments";
import { detectEnvironment, isValidEnvironment } from "./loader";

export type { Config, Environment };
export { configs, isValidEnvironment };

let resolvedConfig: Config | null = null;

export function getConfig(): Config {
  if (resolvedConfig) return resolvedConfig;

  const env = detectEnvironment();
  resolvedConfig = configs[env];
  return resolvedConfig;
}

export function getConfigForEnv(env: Environment): Config {
  return configs[env];
}
