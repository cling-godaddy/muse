import { Hono } from "hono";
import { createMediaClient, createQueryNormalizer, getIamJwt, type MediaClient, type QueryNormalizer } from "@muse/media";
import { createSitesTable, type SitesTable } from "@muse/db";
import { requireAuth } from "../middleware/auth";
import { trackUsage } from "../utils/usage";

export const searchRoute = new Hono();

searchRoute.use("/*", requireAuth);

let client: MediaClient | null = null;
let normalizer: QueryNormalizer | null = null;
let sitesTable: SitesTable | null = null;

async function getSites(): Promise<SitesTable> {
  if (!sitesTable) {
    sitesTable = await createSitesTable();
  }
  return sitesTable;
}

function getClient(): MediaClient {
  if (!client) {
    client = createMediaClient({ gettyJwt: getIamJwt });
  }
  return client;
}

function getNormalizer(): QueryNormalizer {
  if (!normalizer) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    normalizer = createQueryNormalizer(apiKey);
  }
  return normalizer;
}

searchRoute.get("/images", async (c) => {
  const query = c.req.query("q");
  const siteId = c.req.query("siteId");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  if (!siteId) {
    return c.json({ error: "Query parameter 'siteId' is required" }, 400);
  }

  // Normalize the query via LLM
  const normalized = await getNormalizer()(query);
  const searchQuery = normalized.queryString || query;

  const results = await getClient().search({
    query: searchQuery,
    provider: "getty",
    count: 12,
  });

  const usage = await trackUsage(
    await getSites(),
    siteId,
    normalized.usage,
    "gpt-4o-mini",
    "normalize_query",
  );

  return c.json({ results, usage });
});
