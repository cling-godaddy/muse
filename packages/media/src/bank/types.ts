import type { ImageSearchResult } from "../types";

export interface BankEntry {
  id: string
  provider: string
  url: string
  query: string
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

export interface ImageBank {
  load(): Promise<void>
  store(image: ImageSearchResult, query: string): Promise<void>
  search(query: string, options?: BankSearchOptions): Promise<BankSearchResult>
  sync(): Promise<void>
}

export interface BankConfig {
  bucket: string
  region: string
  prefix?: string
  embed: EmbedFn
  logger?: import("@muse/logger").Logger
}
