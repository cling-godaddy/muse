import type { Config } from "../types";
import { defaults } from "../defaults";

export const development: Config = {
  ...defaults,
  env: "development",
  api: {
    ...defaults.api,
    baseUrl: "https://muse.dev-godaddy.com",
    port: 443,
  },
};
