import { sample, shuffle } from "lodash-es";
import type { Logger } from "@muse/logger";
import type { MediaClient, MediaProvider, ImagePlan, ImageSelection, ImageSearchOptions, ImageSearchResult, ImageCategory } from "./types";
import type { ImageBank } from "./bank";
import type { QueryNormalizer, MediaQueryIntent } from "./normalize";
import { createUnsplashProvider } from "./unsplash";
import { createPexelsProvider } from "./pexels";

export interface MediaClientConfig {
  unsplashKey?: string
  pexelsKey?: string
  cacheTtlMs?: number
  logger?: Logger
  bank?: ImageBank
  normalizer?: QueryNormalizer
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
const CONFIDENT_SCORE = 0.90; // Only use bank when highly confident
const MIXED_ORIENTATIONS = ["horizontal", "vertical", "square"] as const;
const DEDUP_BUFFER = 5; // Extra images per orientation to handle cross-block dedup

export function createMediaClient(config: MediaClientConfig): MediaClient {
  const providers = new Map<string, MediaProvider>();
  const cache = new Map<string, CacheEntry>();
  const cacheTtl = config.cacheTtlMs ?? DEFAULT_CACHE_TTL;
  const log = config.logger ?? noopLogger;
  const bank = config.bank;
  const normalizer = config.normalizer;

  function buildCacheKey(
    provider: string,
    intent: MediaQueryIntent,
    orientation?: string,
    category?: ImageCategory,
  ): string {
    const parts = [provider];
    if (orientation) parts.push(orientation);
    if (category) parts.push(category);
    if (intent.phrases.length) parts.push(`phrases=${intent.phrases.join(",")}`);
    if (intent.terms.length) parts.push(`terms=${intent.terms.join(",")}`);
    return parts.join("|");
  }

  // Fallback for when normalizer isn't available
  function simpleCacheKey(provider: string, query: string, orientation?: string, category?: ImageCategory): string {
    const parts = [provider];
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

  async function storeSafe(
    results: ImageSearchResult[],
    query: string,
  ): Promise<ImageSearchResult[]> {
    if (!bank || results.length === 0) return results;

    const settled = await Promise.allSettled(
      results.map(r => bank.store(r, query)),
    );
    const stored = settled
      .filter((r): r is PromiseFulfilledResult<ImageSearchResult> => r.status === "fulfilled")
      .map(r => r.value);

    bank.sync().catch((err) => {
      log.error("bank_sync_failed", { error: err instanceof Error ? err.message : String(err) });
    });

    return stored.length > 0 ? stored : results;
  }

  if (config.unsplashKey) {
    providers.set("unsplash", createUnsplashProvider(config.unsplashKey));
  }

  if (config.pexelsKey) {
    providers.set("pexels", createPexelsProvider(config.pexelsKey));
  }

  if (providers.size === 0) {
    log.warn("no_providers", { message: "No media provider credentials configured - image search disabled" });
  }
  else {
    log.info("init", { providers: Array.from(providers.keys()) });
  }

  return {
    async search(options: ImageSearchOptions) {
      // Normalize query for consistent caching
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

      // Check bank first (semantic search) - only use if confident
      if (bank) {
        const bankResult = await bank.search(queryString, {
          orientation: options.orientation,
          limit: options.count,
        });
        if (bankResult.results.length > 0 && bankResult.topScore >= CONFIDENT_SCORE) {
          log.debug("bank_hit_confident", { query: queryString, score: bankResult.topScore, count: bankResult.results.length });
          return bankResult.results;
        }
        if (bankResult.results.length > 0) {
          log.debug("bank_hit_borderline", { query: queryString, score: bankResult.topScore });
          // Fall through to provider - borderline match not trusted
        }
      }

      const provider = providers.get(options.provider);
      if (!provider) {
        log.warn("provider_not_configured", { provider: options.provider });
        return [];
      }

      // Check in-memory cache
      const cacheKey = normalizeResult
        ? buildCacheKey(options.provider, normalizeResult.intent, options.orientation)
        : simpleCacheKey(options.provider, options.query, options.orientation);

      const cached = getCached(cacheKey);
      if (cached) {
        log.debug("cache_hit", { provider: options.provider, cacheKey });
        return cached.slice(0, options.count);
      }

      // Fetch from provider
      log.debug("search", { provider: options.provider, query: queryString, orientation: options.orientation });
      const results = await provider.search(queryString, {
        orientation: options.orientation,
        count: options.count,
      });
      log.debug("search_results", { provider: options.provider, query: queryString, count: results.length });

      setCache(cacheKey, results);

      return storeSafe(results, queryString);
    },

    async executePlan(plan: ImagePlan[]): Promise<ImageSelection[]> {
      const selections: ImageSelection[] = [];
      const seen = new Set<string>(); // Track provider:id to dedupe

      for (const item of plan) {
        try {
          const count = item.count ?? 1;

          // Normalize query for consistent caching
          const normalizeResult = normalizer
            ? await normalizer(item.searchQuery)
            : null;

          const queryString = normalizeResult?.queryString ?? item.searchQuery;

          if (normalizeResult && queryString !== item.searchQuery) {
            log.debug("query_normalized", {
              original: item.searchQuery,
              intent: normalizeResult.intent,
              queryString,
              blockId: item.blockId,
            });
          }

          let results: ImageSearchResult[] = [];

          // Check bank first (semantic search) - only use if confident
          // Skip bank for mixed orientation - parallel fetch handles it
          if (bank && item.orientation !== "mixed") {
            const bankResult = await bank.search(queryString, {
              orientation: item.orientation,
              limit: count,
            });
            if (bankResult.results.length > 0 && bankResult.topScore >= CONFIDENT_SCORE) {
              results = bankResult.results;
              log.debug("bank_hit_confident", { query: queryString, blockId: item.blockId, score: bankResult.topScore, count: results.length });
            }
            else if (bankResult.results.length > 0) {
              log.debug("bank_hit_borderline", { query: queryString, blockId: item.blockId, score: bankResult.topScore });
              // Fall through to provider - borderline match not trusted
            }
          }

          // Fall back to providers if no confident bank hit
          if (results.length === 0) {
            const allProviders = Array.from(providers.entries());
            if (allProviders.length === 0) continue;

            // Determine orientations to fetch
            const orientations = item.orientation === "mixed"
              ? MIXED_ORIENTATIONS
              : [item.orientation] as const;

            const numRequests = allProviders.length * orientations.length;
            const perRequest = Math.ceil(count / numRequests) + DEDUP_BUFFER;

            // Parallel fetch from ALL providers × orientations
            const batches = await Promise.all(
              allProviders.flatMap(([pName, prov]) =>
                orientations.map(async (orientation) => {
                  const cacheKey = normalizeResult
                    ? buildCacheKey(pName, normalizeResult.intent, orientation, item.category)
                    : simpleCacheKey(pName, item.searchQuery, orientation, item.category);

                  const cached = getCached(cacheKey);
                  if (cached) {
                    log.debug("cache_hit", { provider: pName, cacheKey, blockId: item.blockId, orientation });
                    return cached;
                  }

                  log.debug("search", { provider: pName, query: queryString, blockId: item.blockId, orientation });
                  const batch = await prov.search(queryString, { orientation, count: perRequest });
                  log.debug("search_results", { provider: pName, query: queryString, orientation, count: batch.length });
                  setCache(cacheKey, batch);
                  return batch;
                }),
              ),
            );

            // Dedupe within batch
            const batchSeen = new Set<string>();
            results = batches.flat().filter((r) => {
              const key = `${r.provider}:${r.id}`;
              if (batchSeen.has(key)) return false;
              batchSeen.add(key);
              return true;
            });

            results = await storeSafe(results, queryString);
          }

          // Add results up to requested count, skipping duplicates
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

          // Fill loop for mixed orientation if we didn't get enough
          if (added < count && item.orientation === "mixed") {
            log.warn("mixed_fill_needed", { blockId: item.blockId, requested: count, got: added });

            const allProviders = Array.from(providers.values());
            const maxAttempts = (count - added) * 2; // Don't loop forever
            let attempts = 0;

            // Try broader fallback queries if original is too specific
            const fallbackQueries = [queryString, item.searchQuery, "restaurant interior", "food photography"];

            fillLoop: while (added < count && attempts < maxAttempts) {
              attempts++;
              const orientation = sample(MIXED_ORIENTATIONS) ?? "horizontal";
              const fillProvider = sample(allProviders);
              const fillQuery = fallbackQueries[Math.min(attempts - 1, fallbackQueries.length - 1)] ?? "restaurant";

              if (!fillProvider) break;

              try {
                const fillResults = await fillProvider.search(fillQuery, { orientation, count: 5 });

                for (const result of fillResults) {
                  if (added >= count) break fillLoop;
                  const key = `${result.provider}:${result.id}`;
                  if (seen.has(key)) continue;
                  seen.add(key);

                  // Store in bank if available
                  const stored = bank ? await bank.store(result, fillQuery) : result;

                  selections.push({
                    blockId: item.blockId,
                    category: item.category,
                    image: {
                      url: stored.displayUrl,
                      alt: stored.title,
                      provider: stored.provider,
                      providerId: stored.id,
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
      }

      // Shuffle selections within each block for visual variety (masonry)
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
  };
}
