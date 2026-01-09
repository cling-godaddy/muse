import { createUsage, type Usage, type UsageAction } from "@muse/ai";
import type { SitesTable } from "@muse/db";

/**
 * Create a Usage object and persist it to the database.
 * Returns undefined if source is undefined.
 */
export async function trackUsage(
  sites: SitesTable,
  siteId: string,
  source: { input: number, output: number } | undefined,
  model: string,
  action: UsageAction,
  detail?: string,
): Promise<Usage | undefined> {
  if (!source) return undefined;

  const usage = createUsage(source, model, action, detail);
  await sites.appendCost(siteId, usage);
  return usage;
}
