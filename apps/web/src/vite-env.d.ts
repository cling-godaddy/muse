/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV?: "local" | "development" | "test" | "production"
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
