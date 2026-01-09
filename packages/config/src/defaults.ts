import type { Config } from "./types";

export const defaults: Config = {
  env: "local",
  api: {
    baseUrl: "http://localhost:3001",
    port: 3001,
  },
};
