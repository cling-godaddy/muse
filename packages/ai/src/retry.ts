import { createLogger } from "@muse/logger";
import type { Provider } from "./types";
import type { AgentInput, SyncAgent } from "./agents/types";

const log = createLogger().child({ agent: "retry" });

export interface RetryOptions {
  maxRetries?: number
  parseJson?: boolean
}

export interface RetryResult<T> {
  success: boolean
  data: T | null
  raw: string
  attempts: number
}

/**
 * Run a sync agent with retry logic for JSON parsing failures.
 * On parse failure, retries with feedback to the LLM.
 */
export async function runWithRetry<T>(
  agent: SyncAgent,
  input: AgentInput,
  provider: Provider,
  parse: (json: string) => T,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const { maxRetries = 2 } = options;
  let lastRaw = "";
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const currentInput = lastError
      ? {
        ...input,
        retryFeedback: `Your previous response was not valid JSON: ${lastError}. Please output ONLY valid JSON.`,
      }
      : input;

    lastRaw = await agent.run(currentInput, provider);

    try {
      const data = parse(lastRaw);
      if (attempt > 1) {
        log.info("retry_succeeded", { agent: agent.config.name, attempt });
      }
      return { success: true, data, raw: lastRaw, attempts: attempt };
    }
    catch (err) {
      lastError = String(err);
      log.warn("parse_attempt_failed", {
        agent: agent.config.name,
        attempt,
        maxRetries: maxRetries + 1,
        error: lastError,
        inputPreview: lastRaw.slice(0, 200),
      });

      if (attempt === maxRetries + 1) {
        return { success: false, data: null, raw: lastRaw, attempts: attempt };
      }
    }
  }

  return { success: false, data: null, raw: lastRaw, attempts: maxRetries + 1 };
}
