import type { Logger } from "@muse/logger";
import type { ImageAttribution } from "../types";

export type Attribution = ImageAttribution;

export interface QueryMapping {
  text: string
  orientation?: "horizontal" | "vertical" | "square"
  embeddingIndex: number
}

export interface BankEntry {
  id: string // "unsplash:abc123"
  provider: string
  providerId: string
  title: string
  description?: string
  width: number
  height: number
  previewKey: string // S3 key for preview image
  displayKey: string // S3 key for display image
  attribution: Attribution
  queries: QueryMapping[]
  createdAt: string
}

export type EmbedFn = (text: string) => Promise<Float32Array>;

export interface BankConfig {
  bucket: string
  region: string
  prefix?: string // S3 key prefix, e.g., "media/"
  minScore?: number // similarity threshold (default 0.85)
  embed: EmbedFn // embedding function (injected to avoid circular dep)
  logger?: Logger
}

export interface BankSearchOptions {
  orientation?: "horizontal" | "vertical" | "square"
  limit?: number
}

export interface BankData {
  version: number
  entries: BankEntry[]
}
