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

      // Check bank first (semantic search)
      if (bank) {
        const bankResults = await bank.search(queryString, {
          orientation: options.orientation,
          limit: options.count,
        });
        if (bankResults.length > 0) {
          log.debug("bank_hit", { query: queryString, count: bankResults.length });
          return bankResults;
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

      // Store in bank and get S3 URLs
      if (bank && results.length > 0) {
        const stored = await Promise.all(
          results.map(r => bank.store(r, queryString)),
        );
        // Sync to S3 in background (don't block)
        bank.sync().catch((err) => {
          log.error("bank_sync_failed", { error: err instanceof Error ? err.message : String(err) });
        });
        return stored;
      }

      return results;
    },

    async executePlan(plan: ImagePlan[]): Promise<ImageSelection[]> {
      const selections: ImageSelection[] = [];

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

          // Check bank first (semantic search)
          if (bank) {
            results = await bank.search(queryString, {
              orientation: item.orientation,
              limit: count,
            });
            if (results.length > 0) {
              log.debug("bank_hit", { query: queryString, blockId: item.blockId, count: results.length });
            }
          }

          // Fall back to provider if bank miss
          if (results.length === 0) {
            let providerName: string = item.provider;
            let activeProvider = providers.get(item.provider);

            if (!activeProvider) {
              const fallbackEntry = providers.entries().next().value as [string, MediaProvider] | undefined;
              if (!fallbackEntry) continue;

              log.warn("provider_fallback", { requested: item.provider, fallback: fallbackEntry[0], blockId: item.blockId });
              providerName = fallbackEntry[0];
              activeProvider = fallbackEntry[1];
            }

            const cacheKey = normalizeResult
              ? buildCacheKey(providerName, normalizeResult.intent, item.orientation, item.category)
              : simpleCacheKey(providerName, item.searchQuery, item.orientation, item.category);

            const cached = getCached(cacheKey);

            if (cached) {
              results = cached;
              log.debug("cache_hit", { provider: providerName, cacheKey, blockId: item.blockId });
            }
            else {
              log.debug("search", { provider: providerName, query: queryString, blockId: item.blockId, category: item.category });
              results = await activeProvider.search(queryString, {
                orientation: item.orientation,
                count,
              });
              log.debug("search_results", { provider: providerName, query: queryString, count: results.length });
              setCache(cacheKey, results);

              // Store in bank and get S3 URLs
              if (bank && results.length > 0) {
                results = await Promise.all(
                  results.map(r => bank.store(r, queryString)),
                );
                // Sync to S3 in background (don't block)
                bank.sync().catch((err) => {
                  log.error("bank_sync_failed", { error: err instanceof Error ? err.message : String(err) });
                });
              }
            }
          }

          // Add results up to requested count
          for (const result of results.slice(0, count)) {
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

      return selections;
    },
  };
}
