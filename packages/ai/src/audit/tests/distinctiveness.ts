import type { AwardTest, AwardTestResult, TestContext, KBEntry } from "../types";

/**
 * Measures how unique an entry is compared to its k-nearest neighbors.
 * Higher distance = more distinctive = higher score.
 */
export const distinctivenessTest: AwardTest = {
  name: "distinctiveness",
  description: "Measures uniqueness vs k-nearest neighbors",

  async run<T extends KBEntry>(ctx: TestContext<T>): Promise<AwardTestResult> {
    const { vectors, index, config, entryId, entry, getEmbedding } = ctx;

    const k = config.distinctivenessK;
    const indexSize = index.ntotal();

    if (indexSize <= 1) {
      return {
        testName: "distinctiveness",
        passed: true,
        score: 1,
        threshold: config.distinctivenessMinDistance,
        details: { skipped: true, reason: "Only one entry in index" },
      };
    }

    // Get or compute primary vector
    let primaryVec = vectors[0];

    if (!primaryVec) {
      // Try to embed from caption if available
      const metadata = (entry as Record<string, unknown>).metadata as { caption?: string } | undefined;
      const caption = metadata?.caption;

      if (!caption) {
        return {
          testName: "distinctiveness",
          passed: false,
          score: 0,
          threshold: config.distinctivenessMinDistance,
          details: { error: "No vectors and no caption to embed" },
        };
      }

      primaryVec = await getEmbedding(caption);
    }

    const searchK = Math.min(k + 1, indexSize);
    const result = index.search(Array.from(primaryVec), searchK);

    // Compute average distance to neighbors (excluding self which has score ~1.0)
    const neighborDistances: number[] = [];

    for (let i = 0; i < result.distances.length; i++) {
      const similarity = result.distances[i];
      if (similarity === undefined) continue;
      // Skip self (very high similarity, typically > 0.99)
      if (similarity > 0.99) continue;
      // Distance = 1 - similarity for normalized vectors
      neighborDistances.push(1 - similarity);
    }

    if (neighborDistances.length === 0) {
      return {
        testName: "distinctiveness",
        passed: true,
        score: 1,
        threshold: config.distinctivenessMinDistance,
        details: { skipped: true, reason: "No neighbors found" },
      };
    }

    const avgDistance = neighborDistances.reduce((a, b) => a + b, 0) / neighborDistances.length;
    const minDistance = Math.min(...neighborDistances);
    const threshold = config.distinctivenessMinDistance;

    // Score: how well does avg distance meet threshold
    // score = 1 if avgDistance >= threshold, scales down from there
    const score = Math.min(avgDistance / threshold, 1);

    return {
      testName: "distinctiveness",
      passed: avgDistance >= threshold,
      score,
      threshold,
      details: {
        entryId,
        avgDistanceToNeighbors: avgDistance,
        minDistanceToNeighbor: minDistance,
        neighborsChecked: neighborDistances.length,
      },
    };
  },
};
