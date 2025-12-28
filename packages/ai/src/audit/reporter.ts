import { writeFileSync } from "fs";
import type { AuditReport, EntryAuditResult, PruneRecommendation } from "./types";

export type ReportFormat = "json" | "md";

export async function generateReport(
  report: AuditReport,
  outputPath: string,
  format: ReportFormat = "json",
): Promise<void> {
  switch (format) {
    case "json":
      writeFileSync(outputPath, JSON.stringify(report, null, 2));
      break;
    case "md":
      writeFileSync(outputPath, formatMarkdown(report));
      break;
  }
}

export function formatMarkdown(report: AuditReport): string {
  const lines: string[] = [
    `# KB Audit Report: ${report.kbName}`,
    "",
    `Generated: ${report.timestamp}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|--------|-------|",
    `| Total entries | ${report.stats.totalEntries} |`,
    `| Keep | ${report.stats.passedEntries} |`,
    `| Review | ${report.stats.reviewEntries} |`,
    `| Prune | ${report.stats.pruneEntries} |`,
    `| Redundant vectors | ${report.stats.redundantVectors} |`,
    "",
  ];

  // Entries needing review
  const reviewEntries = report.entryResults.filter(e => e.recommendation === "review");
  const pruneEntries = report.entryResults.filter(e => e.recommendation === "prune");

  if (pruneEntries.length > 0) {
    lines.push(`## Entries to Prune (${pruneEntries.length})`);
    lines.push("");
    for (const entry of pruneEntries) {
      lines.push(...formatEntryResult(entry));
    }
  }

  if (reviewEntries.length > 0) {
    lines.push(`## Entries to Review (${reviewEntries.length})`);
    lines.push("");
    for (const entry of reviewEntries) {
      lines.push(...formatEntryResult(entry));
    }
  }

  // Clusters
  if (report.clusters.length > 0) {
    lines.push("## Similar Entry Clusters");
    lines.push("");
    for (const cluster of report.clusters) {
      lines.push(`### ${cluster.clusterId}`);
      lines.push(`- Similarity: ${(cluster.centroidSimilarity * 100).toFixed(1)}%`);
      lines.push(`- Suggested action: **${cluster.suggestedAction}**`);
      lines.push("- Entries:");
      for (const entryId of cluster.entries) {
        lines.push(`  - \`${entryId}\``);
      }
      lines.push("");
    }
  }

  // Recommendations summary
  if (report.recommendations.length > 0) {
    lines.push(`## Recommendations (${report.recommendations.length})`);
    lines.push("");
    lines.push("| Type | Target | Reason | Confidence |");
    lines.push("|------|--------|--------|------------|");
    for (const rec of report.recommendations.slice(0, 50)) {
      lines.push(`| ${rec.type} | \`${rec.targetId}\` | ${rec.reason} | ${(rec.confidence * 100).toFixed(0)}% |`);
    }
    if (report.recommendations.length > 50) {
      lines.push(`| ... | ... | ${report.recommendations.length - 50} more recommendations | ... |`);
    }
    lines.push("");
  }

  // Vector-level issues
  if (report.vectorResults.length > 0) {
    lines.push(`## Vector Issues (${report.vectorResults.length})`);
    lines.push("");
    const byEntry = new Map<string, typeof report.vectorResults>();
    for (const v of report.vectorResults) {
      const existing = byEntry.get(v.entryId) || [];
      existing.push(v);
      byEntry.set(v.entryId, existing);
    }

    for (const [entryId, vectors] of byEntry) {
      lines.push(`### ${entryId}`);
      for (const v of vectors) {
        lines.push(`- Vector ${v.vectorIndex} (${v.vectorType}): ${v.reason}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function formatEntryResult(entry: EntryAuditResult): string[] {
  const lines: string[] = [
    `### ${entry.entryId}`,
    "",
    `- Recommendation: **${entry.recommendation}**`,
    `- Score: ${(entry.overallScore * 100).toFixed(1)}%`,
  ];

  if (entry.reason) {
    lines.push(`- Issues: ${entry.reason}`);
  }

  lines.push("");
  lines.push("| Test | Passed | Score | Threshold |");
  lines.push("|------|--------|-------|-----------|");

  for (const test of entry.tests) {
    const passed = test.passed ? "✓" : "✗";
    lines.push(`| ${test.testName} | ${passed} | ${(test.score * 100).toFixed(0)}% | ${(test.threshold * 100).toFixed(0)}% |`);
  }

  lines.push("");
  return lines;
}

export function formatRecommendationsJson(recommendations: PruneRecommendation[]): string {
  return JSON.stringify({ recommendations }, null, 2);
}
