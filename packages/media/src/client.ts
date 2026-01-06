import { sample, shuffle } from "lodash-es";
import type { Logger } from "@muse/logger";
import type { MediaClient, ImagePlan, ImageSelection, ImageSearchOptions, ImageSearchResult, ImageCategory } from "./types";
import type { QueryNormalizer, MediaQueryIntent, NormalizeResult } from "./normalize";
import type { ImageBank } from "./bank";
import { createGettyProvider } from "./getty";

export interface MediaClientConfig {
  gettyJwt: () => Promise<string>
  cacheTtlMs?: number
  logger?: Logger
  normalizer?: QueryNormalizer
  bank?: ImageBank
}

const noopLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => noopLogger,
};

interface CacheEntry {
  results: ImageSearchResult[]
  expiresAt: number
}

const DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MIXED_ORIENTATIONS = ["horizontal", "vertical", "square"] as const;
const DEDUP_BUFFER = 5;

export function createMediaClient(config: MediaClientConfig): MediaClient {
  const cache = new Map<string, CacheEntry>();
  const cacheTtl = config.cacheTtlMs ?? DEFAULT_CACHE_TTL;
  const log = config.logger ?? noopLogger;
  const normalizer = config.normalizer;
  const bank = config.bank;
  const provider = createGettyProvider({ getJwt: config.gettyJwt });

  log.info("init", { provider: "getty", bank: !!bank });

  // track pending store operations for sync
  const pendingStores: Promise<void>[] = [];

  function storeInBank(results: ImageSearchResult[]): void {
    if (!bank) return;
    for (const result of results.slice(0, 1)) {
      const promise = bank.store(result).catch((err) => {
        log.warn("bank_store_failed", { id: result.id, error: String(err) });
      });
      pendingStores.push(promise);
    }
  }

  function buildCacheKey(
    intent: MediaQueryIntent,
    orientation?: string,
    category?: ImageCategory,
  ): string {
    const parts = ["getty"];
    if (orientation) parts.push(orientation);
    if (category) parts.push(category);
    if (intent.phrases.length) parts.push(`phrases=${intent.phrases.join(",")}`);
    if (intent.terms.length) parts.push(`terms=${intent.terms.join(",")}`);
    return parts.join("|");
  }

  function simpleCacheKey(query: string, orientation?: string, category?: ImageCategory): string {
    const parts = ["getty"];
    if (orientation) parts.push(orientation);
    if (category) parts.push(category);
    parts.push(query);
    return parts.join("|");
  }

  function getCached(key: string): ImageSearchResult[] | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.results;
  }

  function setCache(key: string, results: ImageSearchResult[]): void {
    cache.set(key, { results, expiresAt: Date.now() + cacheTtl });
  }

  return {
    async search(options: ImageSearchOptions) {
      const normalizeResult = normalizer
        ? await normalizer(options.query)
        : null;

      const queryString = normalizeResult?.queryString ?? options.query;

      if (normalizeResult && queryString !== options.query) {
        log.debug("query_normalized", {
          original: options.query,
          intent: normalizeResult.intent,
          queryString,
        });
      }

      // check bank for semantic match first
      if (bank && options.count) {
        const bankResult = await bank.search(queryString, {
          orientation: options.orientation,
          limit: options.count,
        });
        if (bankResult.results.length >= options.count) {
          log.debug("bank_hit", { query: queryString, count: bankResult.results.length, topScore: bankResult.topScore });
          return bankResult.results;
        }
      }

      const cacheKey = normalizeResult
        ? buildCacheKey(normalizeResult.intent, options.orientation)
        : simpleCacheKey(options.query, options.orientation);

      const cached = getCached(cacheKey);
      if (cached) {
        log.debug("cache_hit", { cacheKey });
        return cached.slice(0, options.count);
      }

      log.debug("search", { query: queryString, orientation: options.orientation });
      const results = await provider.search(queryString, {
        orientation: options.orientation,
        count: options.count,
      });
      log.debug("search_results", { query: queryString, count: results.length });

      setCache(cacheKey, results);
      if (!cached) {
        storeInBank(results);
      }
      return results;
    },

    async executePlan(plan: ImagePlan[]): Promise<ImageSelection[]> {
      const selections: ImageSelection[] = [];
      const seen = new Set<string>();

      const normalizeCache = new Map<string, NormalizeResult>();
      if (normalizer?.batch) {
        const queries = plan.map(p => p.searchQuery);
        const batchResults = await normalizer.batch(queries);
        for (const [q, r] of batchResults) {
          normalizeCache.set(q, r);
        }
        log.debug("batch_normalize_complete", { queries: queries.length, normalized: batchResults.size });
      }

      await Promise.all(plan.map(async (item) => {
        try {
          const count = item.count ?? 1;
          const normalizeResult = normalizeCache.get(item.searchQuery) ?? null;
          const queryString = normalizeResult?.queryString ?? item.searchQuery;

          if (normalizeResult && queryString !== item.searchQuery) {
            log.debug("query_normalized", {
              original: item.searchQuery,
              intent: normalizeResult.intent,
              queryString,
              blockId: item.blockId,
            });
          }

          const orientations = item.orientation === "mixed"
            ? MIXED_ORIENTATIONS
            : [item.orientation] as const;

          const perRequest = Math.ceil(count / orientations.length) + DEDUP_BUFFER;

          const batches = await Promise.all(
            orientations.map(async (orientation) => {
              const cacheKey = normalizeResult
                ? buildCacheKey(normalizeResult.intent, orientation, item.category)
                : simpleCacheKey(item.searchQuery, orientation, item.category);

              const cached = getCached(cacheKey);
              if (cached) {
                log.debug("cache_hit", { cacheKey, blockId: item.blockId, orientation });
                return cached;
              }

              // check bank for semantic matches before hitting Getty
              if (bank) {
                const bankResult = await bank.search(queryString, { orientation, limit: perRequest });
                if (bankResult.results.length >= perRequest && bankResult.topScore >= 0.88) {
                  log.debug("bank_hit", { query: queryString, blockId: item.blockId, orientation, count: bankResult.results.length, topScore: bankResult.topScore });
                  setCache(cacheKey, bankResult.results);
                  return bankResult.results;
                }
                if (bankResult.results.length > 0) {
                  log.debug("bank_partial", { query: queryString, blockId: item.blockId, orientation, count: bankResult.results.length, topScore: bankResult.topScore, needed: perRequest });
                }
              }

              log.debug("search", { query: queryString, blockId: item.blockId, orientation });
              const batch = await provider.search(queryString, { orientation, count: perRequest });
              log.debug("search_results", { query: queryString, orientation, count: batch.length });
              setCache(cacheKey, batch);
              if (!cached) {
                storeInBank(batch);
              }
              return batch;
            }),
          );

          const batchSeen = new Set<string>();
          const results = batches.flat().filter((r) => {
            const key = `${r.provider}:${r.id}`;
            if (batchSeen.has(key)) return false;
            batchSeen.add(key);
            return true;
          });

          let added = 0;
          for (const result of results) {
            if (added >= count) break;
            const key = `${result.provider}:${result.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            selections.push({
              blockId: item.blockId,
              category: item.category,
              image: {
                url: result.displayUrl,
                alt: result.title,
                provider: result.provider,
                providerId: result.id,
              },
            });
            added++;
          }

          // fill loop for mixed orientation
          if (added < count && item.orientation === "mixed") {
            log.warn("mixed_fill_needed", { blockId: item.blockId, requested: count, got: added });

            const maxAttempts = (count - added) * 2;
            let attempts = 0;
            const fallbackQueries = [queryString, item.searchQuery, "restaurant interior", "food photography"];

            fillLoop: while (added < count && attempts < maxAttempts) {
              attempts++;
              const orientation = sample(MIXED_ORIENTATIONS) ?? "horizontal";
              const fillQuery = fallbackQueries[Math.min(attempts - 1, fallbackQueries.length - 1)] ?? "restaurant";

              try {
                const fillResults = await provider.search(fillQuery, { orientation, count: 5 });

                for (const result of fillResults) {
                  if (added >= count) break fillLoop;
                  const key = `${result.provider}:${result.id}`;
                  if (seen.has(key)) continue;
                  seen.add(key);

                  selections.push({
                    blockId: item.blockId,
                    category: item.category,
                    image: {
                      url: result.displayUrl,
                      alt: result.title,
                      provider: result.provider,
                      providerId: result.id,
                    },
                  });
                  added++;
                }
              }
              catch (fillErr) {
                log.warn("fill_attempt_failed", { blockId: item.blockId, orientation, error: String(fillErr) });
              }
            }

            if (added < count) {
              log.warn("mixed_fill_incomplete", { blockId: item.blockId, requested: count, final: added });
            }
            else {
              log.debug("mixed_fill_complete", { blockId: item.blockId, count: added });
            }
          }
        }
        catch (err) {
          log.error("search_failed", {
            blockId: item.blockId,
            query: item.searchQuery,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }));

      const byBlock = new Map<string, ImageSelection[]>();
      for (const sel of selections) {
        const arr = byBlock.get(sel.blockId) ?? [];
        arr.push(sel);
        byBlock.set(sel.blockId, arr);
      }
      const shuffled: ImageSelection[] = [];
      for (const arr of byBlock.values()) {
        shuffled.push(...shuffle(arr));
      }

      return shuffled;
    },

    async flush() {
      if (!bank) return;
      if (pendingStores.length > 0) {
        await Promise.all(pendingStores);
        pendingStores.length = 0;
      }
      await bank.sync();
    },
  };
}
