import type { MediaClient, MediaProvider, ImagePlan, ImageSelection, ImageSearchOptions } from "./types";
import { createUnsplashProvider } from "./unsplash";
import { createPexelsProvider } from "./pexels";

export interface MediaClientConfig {
  unsplashKey?: string
  pexelsKey?: string
}

export function createMediaClient(config: MediaClientConfig): MediaClient {
  const providers = new Map<string, MediaProvider>();

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

      return provider.search(options.query, {
        orientation: options.orientation,
        count: options.count,
      });
    },

    async executePlan(plan: ImagePlan[]): Promise<ImageSelection[]> {
      const selections: ImageSelection[] = [];

      for (const item of plan) {
        const provider = providers.get(item.provider);
        if (!provider) {
          // Fall back to any available provider
          const fallback = providers.values().next().value;
          if (!fallback) continue;

          console.warn(`Provider ${item.provider} not configured, falling back to ${fallback.name}`);
        }

        const activeProvider = provider ?? providers.values().next().value;
        if (!activeProvider) continue;

        try {
          const results = await activeProvider.search(item.searchQuery, {
            orientation: item.orientation,
            count: 1,
          });

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
