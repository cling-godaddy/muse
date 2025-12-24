import type { Provider, ProviderName } from "./types";
import { createOpenAIProvider } from "./providers/openai";
import { createAnthropicProvider } from "./providers/anthropic";

export interface ClientConfig {
  provider: ProviderName
  openaiKey?: string
  anthropicKey?: string
}

export function createClient(config: ClientConfig): Provider {
  switch (config.provider) {
    case "openai":
      if (!config.openaiKey) throw new Error("openai api key required");
      return createOpenAIProvider(config.openaiKey);

    case "anthropic":
      if (!config.anthropicKey) throw new Error("anthropic api key required");
      return createAnthropicProvider(config.anthropicKey);

    default:
      throw new Error(`unknown provider: ${config.provider}`);
  }
}
