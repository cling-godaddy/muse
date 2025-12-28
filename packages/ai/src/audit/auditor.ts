import type {
  AuditConfig,
  AuditReport,
  AuditStats,
  AwardTest,
  AuditorLoaders,
  EntryAuditResult,
  VectorAuditResult,
  SimilarityCluster,
  PruneRecommendation,
  KBEntry,
  TestContext,
} from "./types";

const DEFAULT_CONFIG: AuditConfig = {
  keepThreshold: 0.7,
  pruneThreshold: 0.3,
  distinctivenessMinDistance: 0.15,
  distinctivenessK: 5,
  qualityMinFields: 5,
  marginalValueThreshold: 0.1,
  intraEntrySimilarityMax: 0.95,
  searchabilityMinHitRate: 0.5,
  searchabilityMaxRank: 5,
  searchabilityQueryCount: 5,
  clusterSimilarityThreshold: 0.9,
};

export interface KBAuditor<T extends KBEntry = KBEntry> {
  audit(): Promise<AuditReport>
  addEntryTest(test: AwardTest<T>): void
  addVectorTest(test: AwardTest<T>): void
}

export interface AuditorOptions<T extends KBEntry = KBEntry> {
  kbName: string
  loaders: AuditorLoaders<T>
  config?: Partial<AuditConfig>
  entryTests?: AwardTest<T>[]
  vectorTests?: AwardTest<T>[]
  onProgress?: (current: number, total: number, entryId: string) => void
}

function computeStats(
  entryResults: EntryAuditResult[],
  vectorResults: VectorAuditResult[],
): AuditStats {
  return {
    totalEntries: entryResults.length,
    totalVectors: vectorResults.length,
    passedEntries: entryResults.filter(e => e.recommendation === "keep").length,
    reviewEntries: entryResults.filter(e => e.recommendation === "review").length,
    pruneEntries: entryResults.filter(e => e.recommendation === "prune").length,
    redundantVectors: vectorResults.filter(v => v.recommendation === "prune").length,
  };
}

function generateRecommendations(
  entryResults: EntryAuditResult[],
  vectorResults: VectorAuditResult[],
  clusters: SimilarityCluster[],
): PruneRecommendation[] {
  const recommendations: PruneRecommendation[] = [];

  // Entry-level recommendations
  for (const entry of entryResults) {
    if (entry.recommendation === "prune") {
      recommendations.push({
        type: "entry",
        targetId: entry.entryId,
        reason: entry.reason || "Failed quality gates",
        confidence: 1 - entry.overallScore,
        approved: undefined,
      });
    }
  }

  // Vector-level recommendations
  for (const vector of vectorResults) {
    if (vector.recommendation === "prune") {
      recommendations.push({
        type: "vector",
        targetId: `${vector.entryId}:${vector.vectorIndex}`,
        reason: vector.reason || "Redundant vector",
        confidence: 0.8,
        approved: undefined,
      });
    }
  }

  // Cluster-based recommendations
  for (const cluster of clusters) {
    if (cluster.suggestedAction === "prune-redundant" && cluster.entries.length > 1) {
      // Keep first, recommend pruning rest
      for (const entryId of cluster.entries.slice(1)) {
        recommendations.push({
          type: "entry",
          targetId: entryId,
          reason: `Redundant with ${cluster.entries[0]} (${(cluster.centroidSimilarity * 100).toFixed(1)}% similar)`,
          confidence: cluster.centroidSimilarity,
          approved: undefined,
        });
      }
    }
  }

  return recommendations;
}

async function clusterSimilarEntries<T extends KBEntry>(
  entries: Map<string, T>,
  loaders: AuditorLoaders<T>,
  config: AuditConfig,
): Promise<SimilarityCluster[]> {
  const clusters: SimilarityCluster[] = [];
  const clustered = new Set<string>();
  const entryList = Array.from(entries.entries());

  for (let i = 0; i < entryList.length; i++) {
    const item = entryList[i];
    if (!item) continue;
    const [entryId, entry] = item;
    if (clustered.has(entryId)) continue;

    const { vectors } = loaders.getVectors(entry);
    if (vectors.length === 0) continue;

    const captionVec = vectors[0];
    if (!captionVec) continue;
    const clusterEntries = [entryId];
    let totalSimilarity = 0;

    // Find similar entries
    for (let j = i + 1; j < entryList.length; j++) {
      const otherItem = entryList[j];
      if (!otherItem) continue;
      const [otherId, otherEntry] = otherItem;
      if (clustered.has(otherId)) continue;

      const { vectors: otherVectors } = loaders.getVectors(otherEntry);
      if (otherVectors.length === 0) continue;

      const otherCaption = otherVectors[0];
      if (!otherCaption) continue;
      const similarity = dotProduct(captionVec, otherCaption);

      if (similarity >= config.clusterSimilarityThreshold) {
        clusterEntries.push(otherId);
        totalSimilarity += similarity;
        clustered.add(otherId);
      }
    }

    if (clusterEntries.length > 1) {
      clustered.add(entryId);
      const avgSimilarity = totalSimilarity / (clusterEntries.length - 1);

      clusters.push({
        clusterId: `cluster-${clusters.length + 1}`,
        entries: clusterEntries,
        centroidSimilarity: avgSimilarity,
        suggestedAction: avgSimilarity > 0.95 ? "prune-redundant" : "keep-all",
      });
    }
  }

  return clusters;
}

function dotProduct(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return sum;
}

export function createKBAuditor<T extends KBEntry = KBEntry>(
  options: AuditorOptions<T>,
): KBAuditor<T> {
  const { kbName, loaders, onProgress } = options;
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const entryTests: AwardTest<T>[] = options.entryTests ? [...options.entryTests] : [];
  const vectorTests: AwardTest<T>[] = options.vectorTests ? [...options.vectorTests] : [];

  return {
    addEntryTest(test: AwardTest<T>) {
      entryTests.push(test);
    },

    addVectorTest(test: AwardTest<T>) {
      vectorTests.push(test);
    },

    async audit(): Promise<AuditReport> {
      const entries = await loaders.loadEntries();
      const index = await loaders.loadIndex();

      const entryResults: EntryAuditResult[] = [];
      const vectorResults: VectorAuditResult[] = [];

      let current = 0;
      const total = entries.size;

      for (const [entryId, entry] of entries) {
        current++;
        onProgress?.(current, total, entryId);

        const { vectors, types } = loaders.getVectors(entry);

        const testContext: TestContext<T> = {
          entry,
          entryId,
          vectors,
          vectorTypes: types,
          index,
          allEntries: entries,
          config,
          getEmbedding: loaders.getEmbedding,
          // Optional searchability context
          getImageUrl: loaders.getImageUrl,
          generateSearchQueries: loaders.generateSearchQueries,
          search: loaders.search,
        };

        // Run entry-level tests
        const testResults = await Promise.all(
          entryTests.map(test => test.run(testContext)),
        );

        const overallScore = testResults.length > 0
          ? testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length
          : 1;

        const recommendation
          = overallScore >= config.keepThreshold
            ? "keep"
            : overallScore <= config.pruneThreshold
              ? "prune"
              : "review";

        const failedTests = testResults.filter(t => !t.passed).map(t => t.testName);

        entryResults.push({
          entryId,
          tests: testResults,
          overallScore,
          recommendation,
          reason: failedTests.length > 0 ? `Failed: ${failedTests.join(", ")}` : undefined,
        });

        // Run vector-level tests
        for (const test of vectorTests) {
          const result = await test.run(testContext);

          // Vector tests may flag individual vectors in details
          const flaggedIndices = result.details?.lowValueIndices as number[] | undefined;
          const redundantPairs = result.details?.redundantPairs as [number, number][] | undefined;

          if (flaggedIndices) {
            for (const idx of flaggedIndices) {
              vectorResults.push({
                entryId,
                vectorIndex: idx,
                vectorType: types[idx] || "expansion",
                tests: [result],
                recommendation: "prune",
                reason: "Low marginal value",
              });
            }
          }

          if (redundantPairs) {
            for (const [, j] of redundantPairs) {
              vectorResults.push({
                entryId,
                vectorIndex: j,
                vectorType: types[j] || "expansion",
                tests: [result],
                recommendation: "prune",
                reason: `Redundant with vector ${j}`,
              });
            }
          }
        }
      }

      // Cluster similar entries
      const clusters = await clusterSimilarEntries(entries, loaders, config);

      // Generate recommendations
      const recommendations = generateRecommendations(entryResults, vectorResults, clusters);

      return {
        kbName,
        timestamp: new Date().toISOString(),
        stats: computeStats(entryResults, vectorResults),
        entryResults,
        vectorResults,
        clusters,
        recommendations,
      };
    },
  };
}
