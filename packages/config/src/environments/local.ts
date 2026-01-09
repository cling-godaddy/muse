import type { Config } from "../types";
import { defaults } from "../defaults";

export const local: Config = {
  ...defaults,
  env: "local",
};
