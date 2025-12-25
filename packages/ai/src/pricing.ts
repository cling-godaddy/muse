export const MODEL_PRICING: Record<string, { input: number, output: number }> = {
  // openai (per million tokens)
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "gpt-4": { input: 30, output: 60 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  // anthropic (per million tokens)
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-opus-4-20250514": { input: 15, output: 75 },
  "claude-3-5-sonnet-20241022": { input: 3, output: 15 },
  "claude-3-opus-20240229": { input: 15, output: 75 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
};

const DEFAULT_PRICING = { input: 3, output: 15 };

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING;
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}
