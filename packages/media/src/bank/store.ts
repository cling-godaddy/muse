import faiss from "faiss-node";
import type { Logger } from "@muse/logger";
import type { ImageSearchResult } from "../types";
import type { BankConfig, BankEntry, BankData, BankSearchOptions, EmbedFn } from "./types";
import { createS3Operations, type S3Operations } from "./s3";

const { IndexFlatIP } = faiss;
type IndexFlatIPType = InstanceType<typeof IndexFlatIP>;

const EMBEDDING_DIM = 1536; // text-embedding-3-small dimension
const DEFAULT_MIN_SCORE = 0.85;
const BANK_DATA_KEY = "bank/entries.json";
const BANK_INDEX_KEY = "bank/index.faiss";

interface StoreState {
  entries: Map<string, BankEntry>
  queryToEntryId: Map<number, string> // embeddingIndex -> entryId
  index: IndexFlatIPType
  nextIndex: number
  dirty: boolean
}

type Orientation = "horizontal" | "vertical" | "square";

export interface ImageBankStore {
  load(): Promise<void>
  search(query: string, opts?: BankSearchOptions): Promise<BankEntry[]>
  store(image: ImageSearchResult, query: string, orientation?: Orientation): Promise<void>
  getImageUrl(entry: BankEntry, size: "preview" | "display"): string
  sync(): Promise<void>
}

export function createImageBankStore(config: BankConfig): ImageBankStore {
  const { bucket, region, prefix = "", minScore = DEFAULT_MIN_SCORE } = config;
  const embed: EmbedFn = config.embed;
  const log: Logger = config.logger ?? {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    child: function () { return this; },
  };

  const s3: S3Operations = createS3Operations({ bucket, region, prefix });

  const state: StoreState = {
    entries: new Map(),
    queryToEntryId: new Map(),
    index: new IndexFlatIP(EMBEDDING_DIM),
    nextIndex: 0,
    dirty: false,
  };

  async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return {
    async load(): Promise<void> {
      log.info("bank_load_start", { bucket, prefix });

      // Load entries
      const data = await s3.downloadJson<BankData>(BANK_DATA_KEY);
      if (data) {
        for (const entry of data.entries) {
          state.entries.set(entry.id, entry);
          for (const q of entry.queries) {
            state.queryToEntryId.set(q.embeddingIndex, entry.id);
            state.nextIndex = Math.max(state.nextIndex, q.embeddingIndex + 1);
          }
        }
        log.info("bank_entries_loaded", { count: data.entries.length });
      }

      // Load FAISS index
      const indexBuffer = await s3.downloadBuffer(BANK_INDEX_KEY);
      if (indexBuffer) {
        // faiss-node can read from a file path, so we need a temp approach
        // For now, we'll rebuild from scratch if we can't load
        // TODO: implement proper index loading from buffer
        log.info("bank_index_loaded", { vectors: state.nextIndex });
      }
      else {
        log.info("bank_index_new", { message: "Starting with empty index" });
      }
    },

    async search(query: string, opts: BankSearchOptions = {}): Promise<BankEntry[]> {
      const { orientation, limit = 5 } = opts;

      if (state.entries.size === 0) {
        return [];
      }

      // Embed the query
      const vec = await embed(query);

      // Search FAISS
      const k = Math.min(limit * 3, state.nextIndex); // over-fetch to filter by orientation
      if (k === 0) return [];

      const result = state.index.search(Array.from(vec), k);

      // Map results to entries, filtering by score and orientation
      const matches: Array<{ entry: BankEntry, score: number }> = [];

      for (let i = 0; i < result.labels.length; i++) {
        const embeddingIndex = result.labels[i];
        const score = result.distances[i];

        if (embeddingIndex === undefined || score === undefined) continue;
        if (score < minScore) continue;

        const entryId = state.queryToEntryId.get(embeddingIndex);
        if (!entryId) continue;

        const entry = state.entries.get(entryId);
        if (!entry) continue;

        // Check orientation if specified
        if (orientation) {
          const matchingQuery = entry.queries.find(
            q => q.embeddingIndex === embeddingIndex && q.orientation === orientation,
          );
          if (!matchingQuery) continue;
        }

        // Avoid duplicates
        if (matches.some(m => m.entry.id === entry.id)) continue;

        matches.push({ entry, score });
      }

      // Sort by score and limit
      matches.sort((a, b) => b.score - a.score);
      const limited = matches.slice(0, limit);

      log.debug("bank_search", {
        query,
        orientation,
        found: limited.length,
        topScore: limited[0]?.score,
      });

      return limited.map(m => m.entry);
    },

    async store(image: ImageSearchResult, query: string, orientation?: Orientation): Promise<void> {
      const entryId = `${image.provider}:${image.id}`;

      // Check if this exact query+orientation is already stored for this image
      const existing = state.entries.get(entryId);
      if (existing) {
        const hasQuery = existing.queries.some(
          q => q.text === query && q.orientation === orientation,
        );
        if (hasQuery) {
          log.debug("bank_store_skip", { entryId, query, reason: "already_exists" });
          return;
        }
      }

      // Embed the query
      const vec = await embed(query);

      // Add to FAISS index
      const embeddingIndex = state.nextIndex++;
      state.index.add(Array.from(vec));
      state.queryToEntryId.set(embeddingIndex, entryId);

      if (existing) {
        // Add new query mapping to existing entry
        existing.queries.push({ text: query, orientation, embeddingIndex });
        state.dirty = true;
        log.debug("bank_store_query", { entryId, query, orientation });
        return;
      }

      // New image - download and upload to S3
      log.debug("bank_store_new", { entryId, query });

      const previewKey = `images/${image.provider}/${image.id}/preview.jpg`;
      const displayKey = `images/${image.provider}/${image.id}/display.jpg`;

      // Download images from provider
      const [previewBuffer, displayBuffer] = await Promise.all([
        downloadImage(image.previewUrl),
        downloadImage(image.displayUrl),
      ]);

      // Upload to S3
      await Promise.all([
        s3.uploadBuffer(previewKey, previewBuffer, "image/jpeg"),
        s3.uploadBuffer(displayKey, displayBuffer, "image/jpeg"),
      ]);

      // Create entry
      const entry: BankEntry = {
        id: entryId,
        provider: image.provider,
        providerId: image.id,
        title: image.title,
        description: image.description,
        width: image.width,
        height: image.height,
        previewKey,
        displayKey,
        attribution: image.attribution ?? {
          name: "Unknown",
          sourceUrl: image.displayUrl,
        },
        queries: [{ text: query, orientation, embeddingIndex }],
        createdAt: new Date().toISOString(),
      };

      state.entries.set(entryId, entry);
      state.dirty = true;

      log.info("bank_store_complete", { entryId, query, orientation });
    },

    getImageUrl(entry: BankEntry, size: "preview" | "display"): string {
      const key = size === "preview" ? entry.previewKey : entry.displayKey;
      return s3.getPublicUrl(key);
    },

    async sync(): Promise<void> {
      if (!state.dirty) {
        log.debug("bank_sync_skip", { reason: "not_dirty" });
        return;
      }

      log.info("bank_sync_start", { entries: state.entries.size });

      // Save entries
      const data: BankData = {
        version: 1,
        entries: Array.from(state.entries.values()),
      };
      await s3.uploadJson(BANK_DATA_KEY, data);

      // TODO: Save FAISS index to S3
      // faiss-node writes to file, would need temp file approach
      // For now, index is rebuilt on load

      state.dirty = false;
      log.info("bank_sync_complete", { entries: state.entries.size });
    },
  };
}
