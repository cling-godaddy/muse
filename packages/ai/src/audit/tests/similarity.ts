import type { AwardTest, AwardTestResult, TestContext, KBEntry } from "../types";

function dotProduct(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return sum;
}

/**
 * Identifies redundant vectors within an entry.
 * Vectors that are too similar to each other waste index space.
 */
export const similarityTest: AwardTest = {
  name: "intra-entry-similarity",
  description: "Identifies redundant vectors within entry",

  async run<T extends KBEntry>(ctx: TestContext<T>): Promise<AwardTestResult> {
    const { vectors, vectorTypes, config } = ctx;

    if (vectors.length < 2) {
      return {
        testName: "intra-entry-similarity",
        passed: true,
        score: 1,
        threshold: config.intraEntrySimilarityMax,
        details: { skipped: true, reason: "Less than 2 vectors" },
      };
    }

    const threshold = config.intraEntrySimilarityMax;
    const redundantPairs: { i: number, j: number, similarity: number, types: [string, string] }[] = [];

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const vecI = vectors[i];
        const vecJ = vectors[j];
        if (!vecI || !vecJ) continue;
        const similarity = dotProduct(vecI, vecJ);

        if (similarity > threshold) {
          redundantPairs.push({
            i,
            j,
            similarity,
            types: [vectorTypes[i] || "unknown", vectorTypes[j] || "unknown"],
          });
        }
      }
    }

    // Calculate total possible pairs
    const totalPairs = (vectors.length * (vectors.length - 1)) / 2;
    const score = 1 - (redundantPairs.length / totalPairs);

    return {
      testName: "intra-entry-similarity",
      passed: redundantPairs.length === 0,
      score,
      threshold,
      details: {
        redundantPairs: redundantPairs.map(p => [p.i, p.j] as [number, number]),
        redundantPairDetails: redundantPairs,
        totalVectors: vectors.length,
        redundantCount: redundantPairs.length,
        // For pruning: suggest keeping the first vector of each pair
        suggestedPrune: redundantPairs.map(p => p.j),
      },
    };
  },
};
