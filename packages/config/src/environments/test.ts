import type { Config } from "../types";
import { defaults } from "../defaults";

export const test: Config = {
  ...defaults,
  env: "test",
  api: {
    ...defaults.api,
    baseUrl: "https://muse.test-godaddy.com",
    port: 443,
  },
};
