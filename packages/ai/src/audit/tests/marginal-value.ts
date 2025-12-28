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
 * For multi-vector entries, measures if expansion vectors add retrieval value.
 * Expansion vectors that are too similar to the caption provide little marginal value.
 */
export const marginalValueTest: AwardTest = {
  name: "marginal-value",
  description: "Measures value-add of expansion vectors",

  async run<T extends KBEntry>(ctx: TestContext<T>): Promise<AwardTestResult> {
    const { vectors, vectorTypes, config } = ctx;

    // Find expansion vectors
    const expansionIndices: number[] = [];
    for (let i = 0; i < vectorTypes.length; i++) {
      if (vectorTypes[i] === "expansion") {
        expansionIndices.push(i);
      }
    }

    if (expansionIndices.length === 0 || vectors.length < 2) {
      return {
        testName: "marginal-value",
        passed: true,
        score: 1,
        threshold: config.marginalValueThreshold,
        details: { skipped: true, reason: "No expansion vectors" },
      };
    }

    const captionVec = vectors[0];
    if (!captionVec) {
      return {
        testName: "marginal-value",
        passed: true,
        score: 1,
        threshold: config.marginalValueThreshold,
        details: { skipped: true, reason: "No caption vector" },
      };
    }

    const expansionValues: { index: number, distance: number }[] = [];

    for (const idx of expansionIndices) {
      const expVec = vectors[idx];
      if (!expVec) continue;

      // Cosine similarity (vectors are normalized)
      const similarity = dotProduct(captionVec, expVec);
      // Distance = 1 - similarity
      const distance = 1 - similarity;
      expansionValues.push({ index: idx, distance });
    }

    if (expansionValues.length === 0) {
      return {
        testName: "marginal-value",
        passed: true,
        score: 1,
        threshold: config.marginalValueThreshold,
        details: { skipped: true, reason: "No valid expansion vectors" },
      };
    }

    const threshold = config.marginalValueThreshold;

    // Identify low-value expansions (too similar to caption)
    const lowValueIndices = expansionValues
      .filter(({ distance }) => distance < threshold)
      .map(({ index }) => index);

    const avgMarginalValue = expansionValues.reduce((sum, v) => sum + v.distance, 0) / expansionValues.length;

    // Score: proportion of expansions that meet threshold
    const goodExpansions = expansionValues.filter(v => v.distance >= threshold).length;
    const score = goodExpansions / expansionValues.length;

    return {
      testName: "marginal-value",
      passed: lowValueIndices.length === 0,
      score,
      threshold,
      details: {
        avgMarginalValue,
        expansionCount: expansionValues.length,
        lowValueIndices,
        lowValueCount: lowValueIndices.length,
        expansionDistances: expansionValues.map(v => ({
          index: v.index,
          distance: v.distance,
          aboveThreshold: v.distance >= threshold,
        })),
      },
    };
  },
};
