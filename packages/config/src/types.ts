export type Environment = "local" | "development" | "test" | "production";

export interface Config {
  env: Environment
  api: {
    baseUrl: string
    port: number
  }
}
