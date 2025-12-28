import type faiss from "faiss-node";

type IndexFlatIP = InstanceType<typeof faiss.IndexFlatIP>;

// Award test result
export interface AwardTestResult {
  testName: string
  passed: boolean
  score: number // 0-1, higher = better
  threshold: number
  details?: Record<string, unknown>
}

// Entry-level audit result
export interface EntryAuditResult {
  entryId: string
  tests: AwardTestResult[]
  overallScore: number
  recommendation: "keep" | "review" | "prune"
  reason?: string
}

// Vector-level audit result
export interface VectorAuditResult {
  entryId: string
  vectorIndex: number
  vectorType: "caption" | "query" | "expansion"
  tests: AwardTestResult[]
  recommendation: "keep" | "prune"
  reason?: string
}

// Cluster of similar entries
export interface SimilarityCluster {
  clusterId: string
  entries: string[]
  centroidSimilarity: number
  suggestedAction: "merge" | "prune-redundant" | "keep-all"
}

// Pruning recommendation
export interface PruneRecommendation {
  type: "entry" | "vector"
  targetId: string // entryId or entryId:vectorIndex
  reason: string
  confidence: number // 0-1
  approved?: boolean
}

// Audit statistics
export interface AuditStats {
  totalEntries: number
  totalVectors: number
  passedEntries: number
  reviewEntries: number
  pruneEntries: number
  redundantVectors: number
}

// Full audit report
export interface AuditReport {
  kbName: string
  timestamp: string
  stats: AuditStats
  entryResults: EntryAuditResult[]
  vectorResults: VectorAuditResult[]
  clusters: SimilarityCluster[]
  recommendations: PruneRecommendation[]
}

// Auditor configuration
export interface AuditConfig {
  // Recommendation thresholds
  keepThreshold: number // Above this = keep (default 0.7)
  pruneThreshold: number // Below this = prune (default 0.3)

  // Test-specific thresholds
  distinctivenessMinDistance: number // Min distance to k-NN (default 0.15)
  distinctivenessK: number // Number of neighbors to check (default 5)
  qualityMinFields: number // Min metadata fields (default 5)
  marginalValueThreshold: number // Min value-add for expansion vectors (default 0.1)
  intraEntrySimilarityMax: number // Max similarity within entry (default 0.95)

  // Searchability test
  searchabilityMinHitRate: number // Min fraction of queries that find entry (default 0.5)
  searchabilityMaxRank: number // Entry should be found within this rank (default 5)
  searchabilityQueryCount: number // Number of queries to generate (default 5)

  // Clustering
  clusterSimilarityThreshold: number // Similarity for clustering (default 0.9)
}

// Generic KB entry (minimum interface)
export interface KBEntry {
  id: string
  [key: string]: unknown
}

// Search result for searchability test
export interface SearchResult {
  entries: { id: string }[]
}

// Context passed to award tests
export interface TestContext<T extends KBEntry = KBEntry> {
  entry: T
  entryId: string
  vectors: Float32Array[]
  vectorTypes: ("caption" | "query" | "expansion")[]
  index: IndexFlatIP
  allEntries: Map<string, T>
  config: AuditConfig
  getEmbedding: (text: string) => Promise<Float32Array>
  // Optional: for searchability test
  getImageUrl?: (entry: T) => string
  generateSearchQueries?: (imageUrl: string) => Promise<string[]>
  search?: (query: string) => Promise<SearchResult>
}

// Award test interface (pluggable)
export interface AwardTest<T extends KBEntry = KBEntry> {
  name: string
  description: string
  run(context: TestContext<T>): Promise<AwardTestResult>
}

// Auditor loader interface
export interface AuditorLoaders<T extends KBEntry = KBEntry> {
  loadEntries(): Promise<Map<string, T>>
  loadIndex(): Promise<IndexFlatIP>
  getVectors(entry: T): { vectors: Float32Array[], types: ("caption" | "query" | "expansion")[] }
  getEmbedding(text: string): Promise<Float32Array>
  // Optional: for searchability test
  getImageUrl?: (entry: T) => string
  generateSearchQueries?: (imageUrl: string) => Promise<string[]>
  search?: (query: string) => Promise<SearchResult>
}

// Pruning result
export interface PruneResult {
  entriesRemoved: string[]
  vectorsRemoved: { entryId: string, vectorIndex: number }[]
  newEntryCount: number
  newVectorCount: number
}
