import faiss from "faiss-node";
import type { Logger } from "@muse/logger";
import type { ImageSearchResult } from "../types";
import type { BankConfig, BankEntry, BankData, BankSearchOptions, BankListOptions, Review, EmbedFn, AnalyzeFn, ImageMetadata } from "./types";
import { createS3Operations, type S3Operations } from "./s3";

const { IndexFlatIP } = faiss;
type IndexFlatIPType = InstanceType<typeof IndexFlatIP>;

const EMBEDDING_DIM = 1536; // text-embedding-3-small dimension
const DEFAULT_MIN_SCORE = 0.88; // Raised to filter weak expansion matches
const BANK_DATA_KEY = "bank/entries.json";
const BANK_INDEX_KEY = "bank/index.faiss";

// Vector type weights for scoring
const VECTOR_WEIGHTS = {
  caption: 1.0, // Ground truth - semantic fallback
  query: 1.0, // Original search queries - primary cache mechanism
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

export interface BankSearchResult {
  entries: BankEntry[]
  topScore: number
}

export interface BankListResult {
  entries: BankEntry[]
  total: number
}

export interface BankStats {
  total: number
  reviewed: number
  pending: number
  approved: number
  flagged: number
  accuracy: {
    accurate: number
    partial: number
    wrong: number
    unrated: number
  }
  searchability: {
    avgScore: number | null
    totalTests: number
  }
}

export interface ImageBankStore {
  load(): Promise<void>
  search(query: string, opts?: BankSearchOptions): Promise<BankSearchResult>
  store(image: ImageSearchResult, query: string): Promise<BankEntry>
  getImageUrl(entry: BankEntry, size: "preview" | "display"): string
  sync(): Promise<void>
  // Review operations
  getEntry(id: string): BankEntry | null
  listEntries(opts?: BankListOptions): BankListResult
  updateReview(id: string, review: Review): void
  setBlacklisted(id: string, blacklisted: boolean): void
  getStats(): BankStats
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
        state.index = faiss.Index.fromBuffer(indexBuffer);
        log.info("bank_index_loaded", { vectors: state.index.ntotal() });
      }
      else {
        log.info("bank_index_new", { message: "Starting with empty index" });
      }
    },

    async search(query: string, opts: BankSearchOptions = {}): Promise<BankSearchResult> {
      const { orientation, limit = 5 } = opts;

      if (state.entries.size === 0) {
        return { entries: [], topScore: 0 };
      }

      // Embed the query
      const vec = await embed(query);

      // Search FAISS - over-fetch to aggregate by image
      const indexSize = state.index.ntotal();
      if (indexSize === 0) return { entries: [], topScore: 0 };

      const k = Math.min(limit * 10, indexSize);

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

        // Skip blacklisted entries
        if (entry.blacklisted) continue;

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
      const topScore = limited[0]?.score ?? 0;

      log.debug("bank_search", {
        query,
        orientation,
        found: limited.length,
        topScore,
        topMatchType: limited[0]?.matchType,
      });

      return { entries: limited.map(m => m.entry), topScore };
    },

    async store(image: ImageSearchResult, query: string): Promise<BankEntry> {
      const entryId = `${image.provider}:${image.id}`;

      // Return existing entry if already stored
      const existing = state.entries.get(entryId);
      if (existing) {
        log.debug("bank_store_existing", { entryId });
        return existing;
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

      // Embed caption (semantic fallback) and query (cache hit)
      const [captionVec, queryVec] = await Promise.all([
        embed(analysis.caption),
        embed(query),
      ]);

      // Add caption vector to FAISS index
      const captionIndex = state.nextIndex++;
      state.index.add(Array.from(captionVec));
      state.vectorToEntry.set(captionIndex, { entryId, type: "caption" });

      // Add query vector to FAISS index
      const queryIndex = state.nextIndex++;
      state.index.add(Array.from(queryVec));
      state.vectorToEntry.set(queryIndex, { entryId, type: "query" });

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
          expansions: [],
        },
        createdAt: new Date().toISOString(),
      };

      state.entries.set(entryId, entry);
      state.dirty = true;

      log.info("bank_store_complete", {
        entryId,
        caption: analysis.caption.slice(0, 50),
        vectors: 2,
      });

      return entry;
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

      // Save FAISS index to S3
      if (state.index.ntotal() > 0) {
        const indexBuffer = state.index.toBuffer();
        await s3.uploadBuffer(BANK_INDEX_KEY, indexBuffer, "application/octet-stream");
        log.info("bank_index_saved", { vectors: state.index.ntotal() });
      }

      state.dirty = false;
      log.info("bank_sync_complete", { entries: state.entries.size });
    },

    getEntry(id: string): BankEntry | null {
      return state.entries.get(id) ?? null;
    },

    listEntries(opts: BankListOptions = {}): BankListResult {
      const { status = "all", accuracy = "all", sort = "oldest", limit = 50, offset = 0 } = opts;

      let entries = Array.from(state.entries.values());

      // Filter by status
      if (status !== "all") {
        entries = entries.filter(e => (e.review?.status ?? "pending") === status);
      }

      // Filter by accuracy
      if (accuracy !== "all") {
        if (accuracy === "unrated") {
          entries = entries.filter(e => e.review?.accuracy == null);
        }
        else {
          entries = entries.filter(e => e.review?.accuracy === accuracy);
        }
      }

      // Sort
      entries.sort((a, b) => {
        if (sort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sort === "worst-searchability") {
          const scoreA = computeSearchability(a.review?.searchTests ?? []);
          const scoreB = computeSearchability(b.review?.searchTests ?? []);
          return (scoreA ?? 1) - (scoreB ?? 1); // nulls go last
        }
        // Default: oldest first, prioritize pending
        const statusOrder = { pending: 0, flagged: 1, approved: 2 };
        const statusA = statusOrder[a.review?.status ?? "pending"];
        const statusB = statusOrder[b.review?.status ?? "pending"];
        if (statusA !== statusB) return statusA - statusB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      const total = entries.length;
      const paginated = entries.slice(offset, offset + limit);

      return { entries: paginated, total };
    },

    updateReview(id: string, review: Review): void {
      const entry = state.entries.get(id);
      if (!entry) {
        log.warn("bank_review_not_found", { id });
        return;
      }
      entry.review = review;
      state.dirty = true;
      log.debug("bank_review_updated", { id, status: review.status, accuracy: review.accuracy });
    },

    setBlacklisted(id: string, blacklisted: boolean): void {
      const entry = state.entries.get(id);
      if (!entry) {
        log.warn("bank_blacklist_not_found", { id });
        return;
      }
      entry.blacklisted = blacklisted;
      state.dirty = true;
      log.debug("bank_blacklist_updated", { id, blacklisted });
    },

    getStats(): BankStats {
      const entries = Array.from(state.entries.values());
      const total = entries.length;

      let reviewed = 0;
      let pending = 0;
      let approved = 0;
      let flagged = 0;
      let accurate = 0;
      let partial = 0;
      let wrong = 0;
      let unrated = 0;
      let totalTests = 0;
      let searchScoreSum = 0;
      let entriesWithTests = 0;

      for (const entry of entries) {
        const review = entry.review;
        const status = review?.status ?? "pending";

        if (status === "pending") pending++;
        else if (status === "approved") approved++;
        else if (status === "flagged") flagged++;

        if (review?.accuracy) {
          reviewed++;
          if (review.accuracy === "accurate") accurate++;
          else if (review.accuracy === "partial") partial++;
          else if (review.accuracy === "wrong") wrong++;
        }
        else {
          unrated++;
        }

        const tests = review?.searchTests ?? [];
        totalTests += tests.length;
        if (tests.length > 0) {
          const score = computeSearchability(tests);
          if (score !== null) {
            searchScoreSum += score;
            entriesWithTests++;
          }
        }
      }

      return {
        total,
        reviewed,
        pending,
        approved,
        flagged,
        accuracy: { accurate, partial, wrong, unrated },
        searchability: {
          avgScore: entriesWithTests > 0 ? searchScoreSum / entriesWithTests : null,
          totalTests,
        },
      };
    },
  };
}

function computeSearchability(tests: { found: boolean, rank: number | null }[]): number | null {
  if (tests.length === 0) return null;
  const scores = tests.map(t => (t.found && t.rank ? 1 / t.rank : 0));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
