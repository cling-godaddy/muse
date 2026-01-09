import type { Config } from "../types";
import { defaults } from "../defaults";

export const production: Config = {
  ...defaults,
  env: "production",
  api: {
    ...defaults.api,
    baseUrl: "https://muse.godaddy.com",
    port: 443,
  },
};
