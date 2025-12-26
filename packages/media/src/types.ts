import type { ImageSource } from "@muse/core";

export interface ImageAttribution {
  name: string
  url?: string
  sourceUrl: string
}

export interface ImageSearchResult {
  id: string
  title: string
  description?: string
  previewUrl: string
  displayUrl: string
  width: number
  height: number
  provider: string
  attribution?: ImageAttribution
}

export interface ImageSearchOptions {
  query: string
  provider: "unsplash" | "pexels"
  orientation?: "horizontal" | "vertical" | "square"
  count?: number
}

export interface ImagePlan {
  blockId: string
  placement: "background" | "content" | "feature"
  provider: "unsplash" | "pexels"
  searchQuery: string
  orientation: "horizontal" | "vertical" | "square"
}

export interface ImageSelection {
  blockId: string
  placement: string
  image: ImageSource
}

export interface MediaProvider {
  name: string
  search(query: string, options?: {
    orientation?: "horizontal" | "vertical" | "square"
    count?: number
  }): Promise<ImageSearchResult[]>
}

export interface ExecutePlanOptions {
  minPerBlock?: Record<string, number>
}

export interface MediaClient {
  search(options: ImageSearchOptions): Promise<ImageSearchResult[]>
  executePlan(plan: ImagePlan[], options?: ExecutePlanOptions): Promise<ImageSelection[]>
}
