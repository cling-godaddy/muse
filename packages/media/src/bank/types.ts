import type { ImageSearchResult } from "../types";

export interface ImageMetadata {
  caption: string
  subjects: string[]
  style: string
  mood: string
}

export interface BankEntry {
  id: string
  provider: string
  url: string
  metadata: ImageMetadata
  embedding: number[]
  createdAt: string
}

export interface BankSearchResult {
  results: ImageSearchResult[]
  topScore: number
}

export interface BankSearchOptions {
  orientation?: "horizontal" | "vertical" | "square"
  limit?: number
}

export type EmbedFn = (text: string) => Promise<number[]>;
export type AnalyzeFn = (url: string) => Promise<ImageMetadata>;

export interface ImageBank {
  load(): Promise<void>
  store(image: ImageSearchResult): Promise<void>
  search(query: string, options?: BankSearchOptions): Promise<BankSearchResult>
  sync(): Promise<void>
}

export interface BankConfig {
  bucket: string
  region: string
  prefix?: string
  embed: EmbedFn
  analyze: AnalyzeFn
  logger?: import("@muse/logger").Logger
}
