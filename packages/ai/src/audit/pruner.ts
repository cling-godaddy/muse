import type { PruneRecommendation, PruneResult } from "./types";

export interface PruneOptions {
  dryRun?: boolean
}

export interface PruneCallbacks {
  removeEntry(entryId: string): Promise<void>
  removeVectors(entryId: string, vectorIndices: number[]): Promise<void>
  rebuildIndex(): Promise<void>
  getStats(): Promise<{ entryCount: number, vectorCount: number }>
}

/**
 * Executes pruning based on approved recommendations.
 * Requires callbacks for the actual data operations.
 */
export async function executePrune(
  recommendations: PruneRecommendation[],
  callbacks: PruneCallbacks,
  options: PruneOptions = {},
): Promise<PruneResult> {
  const { dryRun = false } = options;

  // Filter to approved recommendations only
  const approved = recommendations.filter(r => r.approved === true);

  if (approved.length === 0) {
    const stats = await callbacks.getStats();
    return {
      entriesRemoved: [],
      vectorsRemoved: [],
      newEntryCount: stats.entryCount,
      newVectorCount: stats.vectorCount,
    };
  }

  const entriesRemoved: string[] = [];
  const vectorsRemoved: { entryId: string, vectorIndex: number }[] = [];

  // Group vector recommendations by entry
  const vectorsByEntry = new Map<string, number[]>();

  for (const rec of approved) {
    if (rec.type === "entry") {
      entriesRemoved.push(rec.targetId);
    }
    else if (rec.type === "vector") {
      const parts = rec.targetId.split(":");
      const entryId = parts[0];
      const vectorIdxStr = parts[1];
      if (!entryId || !vectorIdxStr) continue;

      const vectorIdx = parseInt(vectorIdxStr, 10);

      if (!entriesRemoved.includes(entryId)) {
        const existing = vectorsByEntry.get(entryId) || [];
        existing.push(vectorIdx);
        vectorsByEntry.set(entryId, existing);

        vectorsRemoved.push({ entryId, vectorIndex: vectorIdx });
      }
    }
  }

  if (!dryRun) {
    // Remove entries first
    for (const entryId of entriesRemoved) {
      await callbacks.removeEntry(entryId);
    }

    // Remove vectors (only for entries that weren't fully removed)
    for (const [entryId, indices] of vectorsByEntry) {
      if (!entriesRemoved.includes(entryId)) {
        await callbacks.removeVectors(entryId, indices);
      }
    }

    // Rebuild index
    await callbacks.rebuildIndex();
  }

  const stats = await callbacks.getStats();

  return {
    entriesRemoved,
    vectorsRemoved,
    newEntryCount: stats.entryCount,
    newVectorCount: stats.vectorCount,
  };
}

/**
 * Loads recommendations from a JSON file and marks approved ones.
 */
export function parseApprovedRecommendations(json: string): PruneRecommendation[] {
  const data = JSON.parse(json) as { recommendations: PruneRecommendation[] };
  return data.recommendations;
}

/**
 * Auto-approve high-confidence recommendations for automation.
 */
export function autoApprove(
  recommendations: PruneRecommendation[],
  options: { minConfidence?: number, vectorsOnly?: boolean } = {},
): PruneRecommendation[] {
  const { minConfidence = 0.95, vectorsOnly = true } = options;

  return recommendations.map(rec => ({
    ...rec,
    approved: rec.confidence >= minConfidence && (!vectorsOnly || rec.type === "vector"),
  }));
}
