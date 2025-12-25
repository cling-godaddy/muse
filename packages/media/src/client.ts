import type { Logger } from "@muse/logger";
import type { MediaClient, MediaProvider, ImagePlan, ImageSelection, ImageSearchOptions, ImageSearchResult } from "./types";
import { createUnsplashProvider } from "./unsplash";
import { createPexelsProvider } from "./pexels";

export interface MediaClientConfig {
  unsplashKey?: string
  pexelsKey?: string
  cacheTtlMs?: number
  logger?: Logger
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

  function getCacheKey(provider: string, query: string, orientation?: string): string {
    return `${provider}:${query}:${orientation ?? "any"}`;
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
      const provider = providers.get(options.provider);
      if (!provider) {
        log.warn("provider_not_configured", { provider: options.provider });
        return [];
      }

      const cacheKey = getCacheKey(options.provider, options.query, options.orientation);
      const cached = getCached(cacheKey);
      if (cached) {
        log.debug("cache_hit", { provider: options.provider, query: options.query });
        return cached.slice(0, options.count);
      }

      log.debug("search", { provider: options.provider, query: options.query, orientation: options.orientation });
      const results = await provider.search(options.query, {
        orientation: options.orientation,
        count: options.count,
      });
      log.debug("search_results", { provider: options.provider, query: options.query, count: results.length });

      setCache(cacheKey, results);
      return results;
    },

    async executePlan(plan: ImagePlan[]): Promise<ImageSelection[]> {
      const selections: ImageSelection[] = [];

      for (const item of plan) {
        let providerName: string = item.provider;
        let activeProvider = providers.get(item.provider);

        if (!activeProvider) {
          // Fall back to any available provider
          const fallbackEntry = providers.entries().next().value as [string, MediaProvider] | undefined;
          if (!fallbackEntry) continue;

          log.warn("provider_fallback", { requested: item.provider, fallback: fallbackEntry[0], blockId: item.blockId });
          providerName = fallbackEntry[0];
          activeProvider = fallbackEntry[1];
        }

        try {
          const cacheKey = getCacheKey(providerName, item.searchQuery, item.orientation);
          let results = getCached(cacheKey);

          if (!results) {
            log.debug("search", { provider: providerName, query: item.searchQuery, blockId: item.blockId });
            results = await activeProvider.search(item.searchQuery, {
              orientation: item.orientation,
              count: 1,
            });
            log.debug("search_results", { provider: providerName, query: item.searchQuery, count: results.length });
            setCache(cacheKey, results);
          }
          else {
            log.debug("cache_hit", { provider: providerName, query: item.searchQuery, blockId: item.blockId });
          }

          const result = results[0];
          if (result) {
            selections.push({
              blockId: item.blockId,
              placement: item.placement,
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
