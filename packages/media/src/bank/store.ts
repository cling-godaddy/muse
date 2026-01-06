import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import faiss from "faiss-node";
import type { Logger } from "@muse/logger";
import type { ImageSearchResult } from "../types";
import type { BankConfig, BankEntry, BankSearchResult, BankSearchOptions, ImageBank, ImageMetadata } from "./types";

const { IndexFlatIP } = faiss;
const EMBEDDING_DIM = 1536;
const BANK_DATA_KEY = "bank.json";
const BANK_INDEX_KEY = "bank.index";
const DEFAULT_MIN_SCORE = 0.88;

interface BankData {
  entries: BankEntry[]
}

interface BankState {
  entries: Map<string, BankEntry>
  index: InstanceType<typeof IndexFlatIP>
  idToIndex: Map<string, number>
  indexToId: Map<number, string>
  nextIndex: number
  dirty: boolean
}

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => noopLogger,
};

export async function createImageBank(config: BankConfig): Promise<ImageBank> {
  const { bucket, region, prefix = "bank/", embed, analyze } = config;
  const log = config.logger ?? noopLogger;

  const s3 = new S3Client({ region, credentials: fromEnv() });

  const state: BankState = {
    entries: new Map(),
    index: new IndexFlatIP(EMBEDDING_DIM),
    idToIndex: new Map(),
    indexToId: new Map(),
    nextIndex: 0,
    dirty: false,
  };

  async function downloadJson<T>(key: string): Promise<T | null> {
    try {
      const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: prefix + key }));
      const body = await res.Body?.transformToString();
      return body ? JSON.parse(body) : null;
    }
    catch (err: unknown) {
      if ((err as { name?: string }).name === "NoSuchKey") return null;
      throw err;
    }
  }

  async function uploadJson(key: string, data: unknown): Promise<void> {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: prefix + key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    }));
  }

  async function downloadBuffer(key: string): Promise<Buffer | null> {
    try {
      const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: prefix + key }));
      const bytes = await res.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    }
    catch (err: unknown) {
      if ((err as { name?: string }).name === "NoSuchKey") return null;
      throw err;
    }
  }

  async function uploadBuffer(key: string, data: Buffer): Promise<void> {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: prefix + key,
      Body: data,
      ContentType: "application/octet-stream",
    }));
  }

  return {
    async load(): Promise<void> {
      log.info("bank_load_start", { bucket, prefix });

      const data = await downloadJson<BankData>(BANK_DATA_KEY);
      if (data) {
        for (const entry of data.entries) {
          state.entries.set(entry.id, entry);
        }
        log.info("bank_load_entries", { count: data.entries.length });
      }

      const indexBuffer = await downloadBuffer(BANK_INDEX_KEY);
      if (indexBuffer) {
        state.index = IndexFlatIP.fromBuffer(indexBuffer);
        log.info("bank_load_index", { vectors: state.index.ntotal() });

        // rebuild id mappings from entries
        let idx = 0;
        for (const entry of state.entries.values()) {
          state.idToIndex.set(entry.id, idx);
          state.indexToId.set(idx, entry.id);
          idx++;
        }
        state.nextIndex = idx;
      }
      else {
        log.info("bank_index_new");
      }
    },

    async store(image: ImageSearchResult): Promise<void> {
      const entryId = `${image.provider}:${image.id}`;

      if (state.entries.has(entryId)) {
        log.debug("bank_store_skip", { entryId, reason: "exists" });
        return;
      }

      log.debug("bank_store_start", { entryId, url: image.displayUrl });

      // analyze image via URL (no download)
      let metadata: ImageMetadata;
      try {
        metadata = await analyze(image.displayUrl);
        log.debug("bank_analyze_complete", { entryId, caption: metadata.caption.slice(0, 50) });
      }
      catch (err) {
        log.error("bank_analyze_failed", { entryId, error: err instanceof Error ? err.message : String(err) });
        return;
      }

      // embed the caption
      let embedding: number[];
      try {
        embedding = await embed(metadata.caption);
      }
      catch (err) {
        log.error("bank_embed_failed", { entryId, error: err instanceof Error ? err.message : String(err) });
        return;
      }

      // create entry
      const entry: BankEntry = {
        id: entryId,
        provider: image.provider,
        url: image.displayUrl,
        metadata,
        embedding,
        createdAt: new Date().toISOString(),
      };

      // add to FAISS
      const vectorIndex = state.nextIndex++;
      state.index.add(embedding);
      state.idToIndex.set(entryId, vectorIndex);
      state.indexToId.set(vectorIndex, entryId);

      state.entries.set(entryId, entry);
      state.dirty = true;

      log.debug("bank_store_complete", { entryId, vectorIndex });
    },

    async search(query: string, options: BankSearchOptions = {}): Promise<BankSearchResult> {
      const { limit = 10 } = options;

      if (state.index.ntotal() === 0) {
        return { results: [], topScore: 0 };
      }

      const queryEmbedding = await embed(query);
      const k = Math.min(limit * 2, state.index.ntotal());
      const { labels, distances } = state.index.search(queryEmbedding, k);

      const results: ImageSearchResult[] = [];
      let topScore = 0;

      for (let i = 0; i < labels.length && results.length < limit; i++) {
        const vectorIndex = labels[i] ?? -1;
        const score = distances[i] ?? 0;

        if (vectorIndex < 0 || score < DEFAULT_MIN_SCORE) continue;

        const entryId = state.indexToId.get(vectorIndex);
        if (!entryId) continue;

        const entry = state.entries.get(entryId);
        if (!entry) continue;

        if (i === 0) topScore = score;

        // filter by orientation if requested
        // (we don't store orientation, so skip this filter for now)

        results.push({
          id: entry.id.split(":")[1] ?? entry.id,
          title: entry.metadata.caption,
          previewUrl: entry.url,
          displayUrl: entry.url,
          width: 0,
          height: 0,
          provider: entry.provider,
        });
      }

      log.debug("bank_search", { query, found: results.length, topScore });
      return { results, topScore };
    },

    async sync(): Promise<void> {
      if (!state.dirty) {
        log.debug("bank_sync_skip", { reason: "not_dirty" });
        return;
      }

      log.info("bank_sync_start", { entries: state.entries.size });

      // save entries
      const data: BankData = { entries: Array.from(state.entries.values()) };
      await uploadJson(BANK_DATA_KEY, data);

      // save FAISS index
      const indexBuffer = state.index.toBuffer();
      await uploadBuffer(BANK_INDEX_KEY, indexBuffer);

      state.dirty = false;
      log.info("bank_sync_complete");
    },
  };
}
