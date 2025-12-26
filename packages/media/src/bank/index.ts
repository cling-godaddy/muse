import type { ImageSearchResult } from "../types";
import type { BankConfig, BankSearchOptions } from "./types";
import { createImageBankStore, type ImageBankStore } from "./store";

export type { BankConfig, BankEntry, BankSearchOptions, EmbedFn } from "./types";
export type { Attribution, QueryMapping, BankData } from "./types";

type Orientation = "horizontal" | "vertical" | "square";

export interface ImageBank {
  search(query: string, opts?: BankSearchOptions): Promise<ImageSearchResult[]>
  store(result: ImageSearchResult, query: string, orientation?: Orientation): Promise<void>
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

    async store(result: ImageSearchResult, query: string, orientation?: Orientation): Promise<void> {
      await store.store(result, query, orientation);
    },

    async sync(): Promise<void> {
      await store.sync();
    },
  };
}
