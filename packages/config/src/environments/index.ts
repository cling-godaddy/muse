import type { Config, Environment } from "../types";
import { local } from "./local";
import { development } from "./development";
import { test } from "./test";
import { production } from "./production";

export const configs: Record<Environment, Config> = {
  local,
  development,
  test,
  production,
};
