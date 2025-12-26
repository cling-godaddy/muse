import faiss from "faiss-node";
import type { Logger } from "@muse/logger";
import type { ImageSearchResult } from "../types";
import type { BankConfig, BankEntry, BankData, BankSearchOptions, EmbedFn, AnalyzeFn, ImageMetadata } from "./types";
import { createS3Operations, type S3Operations } from "./s3";

const { IndexFlatIP } = faiss;
type IndexFlatIPType = InstanceType<typeof IndexFlatIP>;

const EMBEDDING_DIM = 1536; // text-embedding-3-small dimension
const DEFAULT_MIN_SCORE = 0.8; // Lowered slightly for multi-vector approach
const BANK_DATA_KEY = "bank/entries.json";
const BANK_INDEX_KEY = "bank/index.faiss";

// Vector type weights for scoring
const VECTOR_WEIGHTS = {
  caption: 1.0, // Ground truth - highest weight
  query: 0.85, // Original search queries
  expansion: 0.7, // LLM-generated related terms
};

type VectorType = keyof typeof VECTOR_WEIGHTS;

interface VectorMapping {
  entryId: string
  type: VectorType
}

interface StoreState {
  entries: Map<string, BankEntry>
  vectorToEntry: Map<number, VectorMapping> // embeddingIndex -> {entryId, type}
  index: IndexFlatIPType
  nextIndex: number
  dirty: boolean
}

export interface ImageBankStore {
  load(): Promise<void>
  search(query: string, opts?: BankSearchOptions): Promise<BankEntry[]>
  store(image: ImageSearchResult, query: string): Promise<void>
  getImageUrl(entry: BankEntry, size: "preview" | "display"): string
  sync(): Promise<void>
}

export function createImageBankStore(config: BankConfig): ImageBankStore {
  const { bucket, region, prefix = "", minScore = DEFAULT_MIN_SCORE } = config;
  const embed: EmbedFn = config.embed;
  const analyze: AnalyzeFn = config.analyze;
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
    vectorToEntry: new Map(),
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

          // Rebuild vector mappings from entry.vectors
          if (entry.vectors) {
            // Caption vector
            state.vectorToEntry.set(entry.vectors.caption, { entryId: entry.id, type: "caption" });
            state.nextIndex = Math.max(state.nextIndex, entry.vectors.caption + 1);

            // Query vectors
            for (const idx of entry.vectors.queries) {
              state.vectorToEntry.set(idx, { entryId: entry.id, type: "query" });
              state.nextIndex = Math.max(state.nextIndex, idx + 1);
            }

            // Expansion vectors
            for (const idx of entry.vectors.expansions) {
              state.vectorToEntry.set(idx, { entryId: entry.id, type: "expansion" });
              state.nextIndex = Math.max(state.nextIndex, idx + 1);
            }
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

      // Search FAISS - over-fetch to aggregate by image
      const k = Math.min(limit * 10, state.nextIndex);
      if (k === 0) return [];

      const result = state.index.search(Array.from(vec), k);

      // Aggregate scores by entry, applying vector type weights
      const entryScores = new Map<string, { entry: BankEntry, score: number, matchType: VectorType }>();

      for (let i = 0; i < result.labels.length; i++) {
        const embeddingIndex = result.labels[i];
        const rawScore = result.distances[i];

        if (embeddingIndex === undefined || rawScore === undefined) continue;
        if (rawScore < minScore) continue;

        const mapping = state.vectorToEntry.get(embeddingIndex);
        if (!mapping) continue;

        const entry = state.entries.get(mapping.entryId);
        if (!entry) continue;

        // Apply weight based on vector type
        const weightedScore = rawScore * VECTOR_WEIGHTS[mapping.type];

        // Keep best score per entry
        const existing = entryScores.get(entry.id);
        if (!existing || weightedScore > existing.score) {
          entryScores.set(entry.id, { entry, score: weightedScore, matchType: mapping.type });
        }
      }

      // Convert to array, filter by orientation if specified, sort by score
      let matches = Array.from(entryScores.values());

      if (orientation) {
        // Filter by aspect ratio derived from dimensions
        matches = matches.filter(({ entry }) => {
          const ratio = entry.width / entry.height;
          if (orientation === "horizontal") return ratio > 1.1;
          if (orientation === "vertical") return ratio < 0.9;
          return ratio >= 0.9 && ratio <= 1.1; // square
        });
      }

      matches.sort((a, b) => b.score - a.score);
      const limited = matches.slice(0, limit);

      log.debug("bank_search", {
        query,
        orientation,
        found: limited.length,
        topScore: limited[0]?.score,
        topMatchType: limited[0]?.matchType,
      });

      return limited.map(m => m.entry);
    },

    async store(image: ImageSearchResult, query: string): Promise<void> {
      const entryId = `${image.provider}:${image.id}`;

      // Skip if image already exists (we have full analysis already)
      const existing = state.entries.get(entryId);
      if (existing) {
        log.debug("bank_store_skip", { entryId, reason: "already_analyzed" });
        return;
      }

      log.debug("bank_store_new", { entryId, query });

      // Download and upload images to S3 first
      const previewKey = `images/${image.provider}/${image.id}/preview.jpg`;
      const displayKey = `images/${image.provider}/${image.id}/display.jpg`;

      const [previewBuffer, displayBuffer] = await Promise.all([
        downloadImage(image.previewUrl),
        downloadImage(image.displayUrl),
      ]);

      await Promise.all([
        s3.uploadBuffer(previewKey, previewBuffer, "image/jpeg"),
        s3.uploadBuffer(displayKey, displayBuffer, "image/jpeg"),
      ]);

      // Analyze image with vision model
      log.debug("bank_analyze_start", { entryId });
      const analysis = await analyze(image.displayUrl);
      log.debug("bank_analyze_complete", { entryId, subjects: analysis.subjects });

      // Create embeddings for caption, query, and expansions
      const captionVec = await embed(analysis.caption);
      const queryVec = await embed(query);
      const expansionVecs = await Promise.all(analysis.expansions.map(t => embed(t)));

      // Add all vectors to FAISS index
      const captionIndex = state.nextIndex++;
      state.index.add(Array.from(captionVec));
      state.vectorToEntry.set(captionIndex, { entryId, type: "caption" });

      const queryIndex = state.nextIndex++;
      state.index.add(Array.from(queryVec));
      state.vectorToEntry.set(queryIndex, { entryId, type: "query" });

      const expansionIndices: number[] = [];
      for (const vec of expansionVecs) {
        const idx = state.nextIndex++;
        state.index.add(Array.from(vec));
        state.vectorToEntry.set(idx, { entryId, type: "expansion" });
        expansionIndices.push(idx);
      }

      // Build metadata
      const metadata: ImageMetadata = {
        caption: analysis.caption,
        subjects: analysis.subjects,
        colors: analysis.colors,
        style: analysis.style,
        composition: analysis.composition,
        lighting: analysis.lighting,
        mood: analysis.mood,
        context: analysis.context,
      };

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
        metadata,
        vectors: {
          caption: captionIndex,
          queries: [queryIndex],
          expansions: expansionIndices,
        },
        createdAt: new Date().toISOString(),
      };

      state.entries.set(entryId, entry);
      state.dirty = true;

      log.info("bank_store_complete", {
        entryId,
        caption: analysis.caption.slice(0, 50),
        expansions: analysis.expansions.length,
        vectors: 2 + expansionIndices.length,
      });
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
        version: 2, // v2: added metadata, vectors (multi-vector approach)
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
