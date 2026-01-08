import type { UsageAction } from "@muse/core";

const actionLabels: Record<UsageAction, string> = {
  generate_site: "Site Generation",
  generate_section: "Section Generation",
  generate_item: "Item Generation",
  refine: "Refinement",
  normalize_query: "Query Normalization",
  rewrite_text: "Text Rewrite",
  suggest_rewrites: "Rewrite Suggestions",
};

export function formatAction(action?: UsageAction): string {
  if (!action) return "Unknown";
  return actionLabels[action] ?? action;
}
