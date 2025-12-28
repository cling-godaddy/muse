import type { AwardTest, AwardTestResult, TestContext, KBEntry } from "../types";

interface SearchTestResult {
  query: string
  found: boolean
  rank: number | null
}

/**
 * Tests if an entry can be found via realistic search queries.
 *
 * Process:
 * 1. Vision model generates N plausible search queries from image
 * 2. Run each query against the KB
 * 3. Check if this entry appears in results and at what rank
 * 4. Score based on hit rate and average rank
 */
export const searchabilityTest: AwardTest = {
  name: "searchability",
  description: "Tests if entry can be found via realistic search queries",

  async run<T extends KBEntry>(ctx: TestContext<T>): Promise<AwardTestResult> {
    const { entry, entryId, config, getImageUrl, generateSearchQueries, search } = ctx;

    // Check if searchability test dependencies are available
    if (!getImageUrl || !generateSearchQueries || !search) {
      return {
        testName: "searchability",
        passed: true,
        score: 1,
        threshold: config.searchabilityMinHitRate,
        details: { skipped: true, reason: "Searchability test not configured" },
      };
    }

    const imageUrl = getImageUrl(entry);
    if (!imageUrl) {
      return {
        testName: "searchability",
        passed: false,
        score: 0,
        threshold: config.searchabilityMinHitRate,
        details: { error: "Could not get image URL" },
      };
    }

    // Generate search queries from image
    let queries: string[];
    try {
      queries = await generateSearchQueries(imageUrl);
    }
    catch (err) {
      return {
        testName: "searchability",
        passed: false,
        score: 0,
        threshold: config.searchabilityMinHitRate,
        details: { error: `Failed to generate queries: ${err}` },
      };
    }

    if (queries.length === 0) {
      return {
        testName: "searchability",
        passed: false,
        score: 0,
        threshold: config.searchabilityMinHitRate,
        details: { error: "No queries generated" },
      };
    }

    // Run each query and check results
    const testResults: SearchTestResult[] = [];
    let hits = 0;
    let rankSum = 0;
    let rankedHits = 0;

    for (const query of queries) {
      try {
        const result = await search(query);
        const rank = result.entries.findIndex(e => e.id === entryId);
        const found = rank >= 0 && rank < config.searchabilityMaxRank;

        testResults.push({
          query,
          found,
          rank: rank >= 0 ? rank + 1 : null, // 1-indexed
        });

        if (found) {
          hits++;
          rankSum += rank + 1;
          rankedHits++;
        }
      }
      catch {
        testResults.push({
          query,
          found: false,
          rank: null,
        });
      }
    }

    const hitRate = hits / queries.length;
    const avgRank = rankedHits > 0 ? rankSum / rankedHits : null;

    // Score: weight hit rate more heavily, penalize poor rank
    // hitRate 1.0 + avgRank 1 = score 1.0
    // hitRate 0.5 + avgRank 3 = score ~0.4
    const rankPenalty = avgRank ? Math.max(0, 1 - (avgRank - 1) / config.searchabilityMaxRank) : 0;
    const score = hitRate * 0.7 + (hitRate > 0 ? rankPenalty * 0.3 : 0);

    const passed = hitRate >= config.searchabilityMinHitRate;

    return {
      testName: "searchability",
      passed,
      score,
      threshold: config.searchabilityMinHitRate,
      details: {
        entryId,
        hitRate,
        avgRank,
        queriesGenerated: queries.length,
        hitsWithinRank: hits,
        tests: testResults,
      },
    };
  },
};
