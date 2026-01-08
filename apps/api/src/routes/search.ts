import { Hono } from "hono";
import { createMediaClient, createQueryNormalizer, getIamJwt, type MediaClient, type QueryNormalizer } from "@muse/media";
import { calculateCost } from "@muse/ai";
import { requireAuth } from "../middleware/auth";

export const searchRoute = new Hono();

searchRoute.use("/*", requireAuth);

let client: MediaClient | null = null;
let normalizer: QueryNormalizer | null = null;

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

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  // Normalize the query via LLM
  const normalized = await getNormalizer()(query);
  const searchQuery = normalized.queryString || query;

  const results = await getClient().search({
    query: searchQuery,
    provider: "getty",
    count: 12,
  });

  // Calculate cost if we have usage
  const usage = normalized.usage
    ? {
      input: normalized.usage.input,
      output: normalized.usage.output,
      cost: calculateCost("gpt-4o-mini", normalized.usage.input, normalized.usage.output),
      model: "gpt-4o-mini",
      action: "normalize_query" as const,
    }
    : undefined;

  return c.json({ results, usage });
});
