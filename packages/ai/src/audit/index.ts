export { createKBAuditor, type KBAuditor, type AuditorOptions } from "./auditor";
export { generateReport, formatMarkdown, formatRecommendationsJson, type ReportFormat } from "./reporter";
export { executePrune, parseApprovedRecommendations, autoApprove, type PruneOptions, type PruneCallbacks } from "./pruner";
export { distinctivenessTest, qualityTest, marginalValueTest, similarityTest, searchabilityTest } from "./tests";

export type {
  AwardTest,
  AwardTestResult,
  AuditConfig,
  AuditReport,
  AuditStats,
  AuditorLoaders,
  EntryAuditResult,
  VectorAuditResult,
  SimilarityCluster,
  PruneRecommendation,
  PruneResult,
  KBEntry,
  TestContext,
  SearchResult,
} from "./types";
