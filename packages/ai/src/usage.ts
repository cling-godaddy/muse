import type { Usage, UsageAction } from "./types";
import { calculateCost } from "./pricing";

/**
 * Create a complete Usage object from raw token counts.
 * Pure builder - no side effects.
 */
export function createUsage(
  source: { input: number, output: number },
  model: string,
  action: UsageAction,
  detail?: string,
): Usage {
  return {
    input: source.input,
    output: source.output,
    cost: calculateCost(model, source.input, source.output),
    model,
    action,
    detail,
    timestamp: new Date().toISOString(),
  };
}
