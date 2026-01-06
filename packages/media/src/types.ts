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
  provider: "getty"
  orientation?: "horizontal" | "vertical" | "square"
  count?: number
}

export type ImageCategory = "ambient" | "subject" | "people";

export interface ImagePlan {
  blockId: string
  category: ImageCategory
  provider: "getty"
  searchQuery: string
  orientation: "horizontal" | "vertical" | "square" | "mixed"
  count?: number
}

export interface ImageSelection {
  blockId: string
  category: ImageCategory
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
  minPerSection?: Record<string, number>
}

export interface MediaClient {
  search(options: ImageSearchOptions): Promise<ImageSearchResult[]>
  executePlan(plan: ImagePlan[], options?: ExecutePlanOptions): Promise<ImageSelection[]>
  flush(): Promise<void>
}
