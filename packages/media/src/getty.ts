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
}

export interface GettyProviderConfig {
  getJwt: () => Promise<string>
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

      return results.map((image): ImageSearchResult => ({
        id: image.id,
        title: `Getty Image ${image.id}`,
        previewUrl: image.url,
        displayUrl: image.url,
        width: 0,
        height: 0,
        provider: "getty",
      }));
    },
  };
}
