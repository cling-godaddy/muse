import type { MediaProvider, ImageSearchResult } from "./types";

interface UnsplashPhoto {
  id: string
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  width: number
  height: number
  user: {
    name: string
    links: {
      html: string
    }
  }
  links: {
    html: string
  }
}

interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

export function createUnsplashProvider(accessKey: string): MediaProvider {
  const baseUrl = "https://api.unsplash.com";

  return {
    name: "unsplash",

    async search(query, options = {}): Promise<ImageSearchResult[]> {
      const params = new URLSearchParams({
        query,
        per_page: String(options.count ?? 5),
      });

      if (options.orientation) {
        params.set("orientation", options.orientation === "horizontal" ? "landscape" : options.orientation === "vertical" ? "portrait" : "squarish");
      }

      const response = await fetch(`${baseUrl}/search/photos?${params}`, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashSearchResponse = await response.json();

      return data.results.map((photo): ImageSearchResult => ({
        id: photo.id,
        title: photo.alt_description ?? photo.description ?? "Untitled",
        description: photo.description ?? undefined,
        previewUrl: photo.urls.small,
        displayUrl: photo.urls.regular,
        width: photo.width,
        height: photo.height,
        provider: "unsplash",
        attribution: {
          name: photo.user.name,
          url: photo.user.links.html,
          sourceUrl: photo.links.html,
        },
      }));
    },
  };
}
