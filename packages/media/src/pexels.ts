import type { MediaProvider, ImageSearchResult } from "./types";

interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  alt: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  photographer: string
}

interface PexelsSearchResponse {
  total_results: number
  page: number
  per_page: number
  photos: PexelsPhoto[]
}

export function createPexelsProvider(apiKey: string): MediaProvider {
  const baseUrl = "https://api.pexels.com/v1";

  return {
    name: "pexels",

    async search(query, options = {}): Promise<ImageSearchResult[]> {
      const params = new URLSearchParams({
        query,
        per_page: String(options.count ?? 5),
      });

      if (options.orientation) {
        params.set("orientation", options.orientation);
      }

      const response = await fetch(`${baseUrl}/search?${params}`, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data: PexelsSearchResponse = await response.json();

      return data.photos.map((photo): ImageSearchResult => ({
        id: String(photo.id),
        title: photo.alt || "Untitled",
        previewUrl: photo.src.medium,
        displayUrl: photo.src.large,
        width: photo.width,
        height: photo.height,
        provider: "pexels",
      }));
    },
  };
}
