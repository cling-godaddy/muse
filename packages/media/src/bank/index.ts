import type { ImageSearchResult } from "../types";
import type { BankConfig, BankSearchOptions } from "./types";
import { createImageBankStore, type ImageBankStore } from "./store";

export type { BankConfig, BankEntry, BankSearchOptions, EmbedFn, AnalyzeFn } from "./types";
export type { Attribution, QueryMapping, BankData, ImageMetadata, VectorIndices, ImageAnalysis } from "./types";

export interface ImageBank {
  search(query: string, opts?: BankSearchOptions): Promise<ImageSearchResult[]>
  store(result: ImageSearchResult, query: string): Promise<ImageSearchResult>
  sync(): Promise<void>
}

export async function createImageBank(config: BankConfig): Promise<ImageBank> {
  const store: ImageBankStore = createImageBankStore(config);

  // Load existing data from S3
  await store.load();

  return {
    async search(query: string, opts?: BankSearchOptions): Promise<ImageSearchResult[]> {
      const entries = await store.search(query, opts);

      // Convert BankEntry to ImageSearchResult
      return entries.map((entry): ImageSearchResult => ({
        id: entry.providerId,
        title: entry.title,
        description: entry.description,
        previewUrl: store.getImageUrl(entry, "preview"),
        displayUrl: store.getImageUrl(entry, "display"),
        width: entry.width,
        height: entry.height,
        provider: entry.provider,
        attribution: entry.attribution,
      }));
    },

    async store(result: ImageSearchResult, query: string): Promise<ImageSearchResult> {
      const entry = await store.store(result, query);
      // Return with S3 URLs
      return {
        id: entry.providerId,
        title: entry.title,
        description: entry.description,
        previewUrl: store.getImageUrl(entry, "preview"),
        displayUrl: store.getImageUrl(entry, "display"),
        width: entry.width,
        height: entry.height,
        provider: entry.provider,
        attribution: entry.attribution,
      };
    },

    async sync(): Promise<void> {
      await store.sync();
    },
  };
}
