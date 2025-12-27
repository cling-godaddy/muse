import OpenAI from "openai";

export interface MediaQueryIntent {
  phrases: string[] // multi-word concepts, sorted
  terms: string[] // single tokens, sorted
}

export interface NormalizeResult {
  intent: MediaQueryIntent
  queryString: string
}

export type QueryNormalizer = (query: string) => Promise<NormalizeResult>;

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

  return async function normalizeQuery(query: string): Promise<NormalizeResult> {
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
      // Fallback: treat entire query as single term
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
  };
}
