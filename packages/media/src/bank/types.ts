import type { Logger } from "@muse/logger";
import type { ImageAttribution } from "../types";

export type Attribution = ImageAttribution;

export interface QueryMapping {
  text: string
  orientation?: "horizontal" | "vertical" | "square"
  embeddingIndex: number
}

export interface ImageMetadata {
  // Content understanding
  caption: string
  subjects: string[]

  // Visual properties
  colors: {
    dominant: string[]
    mood: "warm" | "cool" | "neutral"
  }

  // Composition
  style: string[]
  composition: "centered" | "rule-of-thirds" | "symmetrical" | "asymmetrical" | "other"
  lighting: "natural" | "studio" | "dramatic" | "soft" | "mixed"

  // Semantic
  mood: string[]
  context: string[]
}

export interface VectorIndices {
  caption: number // Primary: what image actually shows
  queries: number[] // Original search queries
  expansions: number[] // LLM-generated related terms
}

// HITL Review types
export type AccuracyRating = "accurate" | "partial" | "wrong";
export type ReviewStatus = "pending" | "approved" | "flagged";

export interface SearchTest {
  query: string
  found: boolean
  rank: number | null // 1-indexed, null if not found
  testedAt: string
}

export interface Review {
  accuracy: AccuracyRating | null
  accuracyAt: string | null
  searchTests: SearchTest[]
  status: ReviewStatus
  notes: string | null
}

export interface BankEntry {
  id: string // "unsplash:abc123"
  provider: string
  providerId: string
  title: string
  description?: string
  width: number
  height: number
  previewKey: string // S3 key for preview image
  displayKey: string // S3 key for display image
  attribution: Attribution
  metadata: ImageMetadata
  vectors: VectorIndices
  createdAt: string
  review?: Review
}

export interface ImageAnalysis {
  caption: string
  subjects: string[]
  colors: {
    dominant: string[]
    mood: "warm" | "cool" | "neutral"
  }
  style: string[]
  composition: "centered" | "rule-of-thirds" | "symmetrical" | "asymmetrical" | "other"
  lighting: "natural" | "studio" | "dramatic" | "soft" | "mixed"
  mood: string[]
  context: string[]
  expansions: string[]
}

export type EmbedFn = (text: string) => Promise<Float32Array>;
export type AnalyzeFn = (imageUrl: string) => Promise<ImageAnalysis>;

export interface BankConfig {
  bucket: string
  region: string
  prefix?: string // S3 key prefix, e.g., "media/"
  minScore?: number // similarity threshold (default 0.85)
  embed: EmbedFn // embedding function (injected to avoid circular dep)
  analyze: AnalyzeFn // vision analysis function
  logger?: Logger
}

export interface BankSearchOptions {
  orientation?: "horizontal" | "vertical" | "square"
  limit?: number
}

export interface BankListOptions {
  status?: ReviewStatus | "all"
  accuracy?: AccuracyRating | "unrated" | "all"
  sort?: "oldest" | "newest" | "worst-searchability"
  limit?: number
  offset?: number
}

export interface BankData {
  version: number
  entries: BankEntry[]
}
