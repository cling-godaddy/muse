import OpenAI from "openai";

export interface MediaQueryIntent {
  phrases: string[] // multi-word concepts, sorted
  terms: string[] // single tokens, sorted
}

export interface NormalizeResult {
  intent: MediaQueryIntent
  queryString: string
}

export interface QueryNormalizer {
  (query: string): Promise<NormalizeResult>
  batch(queries: string[]): Promise<Map<string, NormalizeResult>>
}

export const STOPWORDS = new Set([
  "a", "an", "the", "for", "with", "of", "to", "in", "on",
  "image", "photo", "picture", "hero", "background", "banner",
]);

const SYSTEM_PROMPT = `Extract visual search terms from the prompt for stock photo search.

Output JSON with:
- phrases: multi-word concepts (max 2), e.g. ["new york", "sushi restaurant"]
- terms: single words (max 8), e.g. ["warm", "modern"]

Rules:
- Keep multi-word concepts together as phrases
- Remove non-visual words: "hero", "image", "photo", "background", "for", "a", "the"
- Lowercase everything
- Sort alphabetically within each array

Examples:
- "hero image for sushi restaurant" → { "phrases": ["sushi restaurant"], "terms": [] }
- "warm cozy coffee shop in new york" → { "phrases": ["coffee shop", "new york"], "terms": ["cozy", "warm"] }
- "modern minimal tech startup" → { "phrases": ["tech startup"], "terms": ["minimal", "modern"] }
- "professional team portrait" → { "phrases": [], "terms": ["professional", "team"] }`;

const BATCH_SYSTEM_PROMPT = `Extract visual search terms from multiple prompts for stock photo search.

For each query, output:
- phrases: multi-word concepts (max 2 per query)
- terms: single words (max 8 per query)

Rules:
- Keep multi-word concepts together as phrases
- Remove non-visual words: "hero", "image", "photo", "background", "for", "a", "the"
- Lowercase everything
- Sort alphabetically within each array
- Return results in the same order as input queries`;

export function enforceRules(raw: MediaQueryIntent): MediaQueryIntent {
  const phrases = [...new Set(raw.phrases)]
    .map(p => p.toLowerCase().trim())
    .filter(p => p.length > 0)
    .sort()
    .slice(0, 2);

  const terms = [...new Set(raw.terms)]
    .map(t => t.toLowerCase().trim())
    .filter(t => t.length > 0 && !STOPWORDS.has(t))
    .sort()
    .slice(0, 8);

  return { phrases, terms };
}

export function buildQueryString(intent: MediaQueryIntent): string {
  return [...intent.phrases, ...intent.terms].join(", ");
}

export function createQueryNormalizer(apiKey: string): QueryNormalizer {
  const client = new OpenAI({ apiKey });

  async function normalizeQuery(query: string): Promise<NormalizeResult> {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "query_intent",
          schema: {
            type: "object",
            properties: {
              phrases: {
                type: "array",
                items: { type: "string" },
                description: "Multi-word visual concepts",
              },
              terms: {
                type: "array",
                items: { type: "string" },
                description: "Single-word visual terms",
              },
            },
            required: ["phrases", "terms"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        intent: { phrases: [], terms: [query.toLowerCase()] },
        queryString: query.toLowerCase(),
      };
    }

    const raw = JSON.parse(content) as MediaQueryIntent;
    const intent = enforceRules(raw);

    return {
      intent,
      queryString: buildQueryString(intent),
    };
  }

  async function batchNormalize(queries: string[]): Promise<Map<string, NormalizeResult>> {
    const results = new Map<string, NormalizeResult>();

    if (queries.length === 0) return results;

    // Dedupe queries to minimize tokens
    const uniqueQueries = [...new Set(queries)];

    // Format as numbered list for the LLM
    const userContent = uniqueQueries.map((q, i) => `${i + 1}. "${q}"`).join("\n");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BATCH_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "batch_query_intents",
          schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phrases: {
                      type: "array",
                      items: { type: "string" },
                    },
                    terms: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["phrases", "terms"],
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      // Fallback: return empty map, let caller use original queries
      return results;
    }

    const parsed = JSON.parse(content) as { results: MediaQueryIntent[] };

    // Map results back to original queries
    for (let i = 0; i < uniqueQueries.length; i++) {
      const query = uniqueQueries[i];
      const raw = parsed.results[i];
      if (!query || !raw) continue;

      const intent = enforceRules(raw);
      results.set(query, {
        intent,
        queryString: buildQueryString(intent),
      });
    }

    return results;
  }

  // Attach batch method to the function
  const normalizer = normalizeQuery as QueryNormalizer;
  normalizer.batch = batchNormalize;

  return normalizer;
}
