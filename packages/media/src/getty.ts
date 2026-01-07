import type { MediaProvider, ImageSearchResult } from "./types";

const GETTY_PROXY_URL = "https://getty-images-proxy.api.dev-godaddy.com";
const APP_KEY = "wsb-agent";

interface GettyDisplaySize {
  name: string
  uri: string
  is_watermarked: boolean
}

interface GettyImageResult {
  id: string
  url: string
  display_sizes: GettyDisplaySize[]
  max_dimensions?: {
    width: number
    height: number
  }
}

export interface GettyProviderConfig {
  getJwt: () => Promise<string>
}

type Orientation = "horizontal" | "vertical" | "square";

function calculateOrientation(width: number, height: number): Orientation {
  if (width === 0 || height === 0) return "square"; // fallback for missing dimensions
  const ratio = width / height;
  if (ratio > 1.1) return "horizontal";
  if (ratio < 0.9) return "vertical";
  return "square";
}

export function createGettyProvider(config: GettyProviderConfig): MediaProvider {
  return {
    name: "getty",

    async search(query, options = {}): Promise<ImageSearchResult[]> {
      const jwt = await config.getJwt();

      const params = new URLSearchParams({
        phrase: query,
        pageSize: String(options.count ?? 20),
        fileTypes: "jpg",
        graphicalStyles: "photography",
        minimumSize: "large",
        safeSearch: "true",
        enableUpload: "true",
        reportUsage: "true",
      });

      if (options.orientation) {
        params.append("orientations", options.orientation);
      }

      const response = await fetch(`${GETTY_PROXY_URL}/v1/search?${params}`, {
        headers: {
          "Authorization": `sso-jwt ${jwt}`,
          "x-app-key": APP_KEY,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Getty API error: ${response.status} ${response.statusText}`);
      }

      const results: GettyImageResult[] = await response.json();

      const mapped = results.map((image): ImageSearchResult => {
        // prefer media.gettyimages.com URLs from display_sizes (public, no auth)
        // fall back to isteam URL (requires auth, may fail for vision)
        const gettyUrl = image.display_sizes
          ?.find(d => d.uri.includes("media.gettyimages.com"))?.uri;

        const width = image.max_dimensions?.width ?? 0;
        const height = image.max_dimensions?.height ?? 0;

        return {
          id: image.id,
          title: `Getty Image ${image.id}`,
          previewUrl: gettyUrl ?? image.url,
          displayUrl: gettyUrl ?? image.url,
          width,
          height,
          provider: "getty",
        };
      });

      // client-side orientation filtering to ensure Getty API results match request
      const filtered = options.orientation
        ? mapped.filter((img) => {
          const actual = calculateOrientation(img.width, img.height);
          return actual === options.orientation;
        })
        : mapped;

      return filtered;
    },
  };
}
