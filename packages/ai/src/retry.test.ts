import { describe, it, expect, vi } from "vitest";
import { runWithRetry } from "./retry";
import type { SyncAgent } from "./agents/types";
import type { Provider } from "./types";

describe("runWithRetry", () => {
  const mockProvider = {} as Provider;

  it("succeeds on first attempt with valid JSON", async () => {
    const mockAgent: SyncAgent = {
      config: { name: "test", description: "test" },
      run: vi.fn().mockResolvedValue({ content: "{\"value\": 42}" }),
    };

    const parse = (json: string) => JSON.parse(json);
    const result = await runWithRetry(mockAgent, { prompt: "test" }, mockProvider, parse);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ value: 42 });
    expect(result.attempts).toBe(1);
    expect(mockAgent.run).toHaveBeenCalledTimes(1);
  });

  it("retries on parse failure and succeeds", async () => {
    let attempts = 0;
    const mockAgent: SyncAgent = {
      config: { name: "test", description: "test" },
      run: vi.fn().mockImplementation(async (input) => {
        attempts++;
        if (attempts === 1) {
          return { content: "not valid json" };
        }
        // Second attempt should have retryFeedback
        expect(input.retryFeedback).toContain("not valid JSON");
        return { content: "{\"retried\": true}" };
      }),
    };

    const parse = (json: string) => JSON.parse(json);
    const result = await runWithRetry(mockAgent, { prompt: "test" }, mockProvider, parse);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ retried: true });
    expect(result.attempts).toBe(2);
    expect(mockAgent.run).toHaveBeenCalledTimes(2);
  });

  it("returns failure after max retries exhausted", async () => {
    const mockAgent: SyncAgent = {
      config: { name: "test", description: "test" },
      run: vi.fn().mockResolvedValue({ content: "always invalid" }),
    };

    const parse = (json: string) => JSON.parse(json);
    const result = await runWithRetry(mockAgent, { prompt: "test" }, mockProvider, parse, { maxRetries: 1 });

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.attempts).toBe(2); // 1 initial + 1 retry
    expect(result.raw).toBe("always invalid");
  });
});
