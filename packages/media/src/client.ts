import type { MediaClient, MediaProvider, ImagePlan, ImageSelection, ImageSearchOptions, ImageSearchResult } from "./types";
import { createUnsplashProvider } from "./unsplash";
import { createPexelsProvider } from "./pexels";

export interface MediaClientConfig {
  unsplashKey?: string
  pexelsKey?: string
  cacheTtlMs?: number
}

interface CacheEntry {
  results: ImageSearchResult[]
  expiresAt: number
}

const DEFAULT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export function createMediaClient(config: MediaClientConfig): MediaClient {
  const providers = new Map<string, MediaProvider>();
  const cache = new Map<string, CacheEntry>();
  const cacheTtl = config.cacheTtlMs ?? DEFAULT_CACHE_TTL;

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
    console.warn("No media provider credentials configured - image search disabled");
  }

  return {
    async search(options: ImageSearchOptions) {
      const provider = providers.get(options.provider);
      if (!provider) {
        console.warn(`Provider ${options.provider} not configured, skipping search`);
        return [];
      }

      const cacheKey = getCacheKey(options.provider, options.query, options.orientation);
      const cached = getCached(cacheKey);
      if (cached) {
        return cached.slice(0, options.count);
      }

      const results = await provider.search(options.query, {
        orientation: options.orientation,
        count: options.count,
      });

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

          console.warn(`Provider ${item.provider} not configured, falling back to ${fallbackEntry[0]}`);
          providerName = fallbackEntry[0];
          activeProvider = fallbackEntry[1];
        }

        try {
          const cacheKey = getCacheKey(providerName, item.searchQuery, item.orientation);
          let results = getCached(cacheKey);

          if (!results) {
            results = await activeProvider.search(item.searchQuery, {
              orientation: item.orientation,
              count: 1,
            });
            setCache(cacheKey, results);
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
          console.error(`Image search failed for ${item.blockId}:`, err);
        }
      }

      return selections;
    },
  };
}
