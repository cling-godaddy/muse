import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createUsage } from "./usage";

describe("createUsage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a usage object with calculated cost", () => {
    const usage = createUsage(
      { input: 1000, output: 500 },
      "gpt-4o-mini",
      "refine",
      "edit_section",
    );

    expect(usage).toEqual({
      input: 1000,
      output: 500,
      cost: expect.any(Number),
      model: "gpt-4o-mini",
      action: "refine",
      detail: "edit_section",
      timestamp: "2024-01-15T10:30:00.000Z",
    });
    expect(usage.cost).toBeGreaterThan(0);
  });

  it("works without detail", () => {
    const usage = createUsage(
      { input: 100, output: 50 },
      "gpt-4o",
      "generate_site",
    );

    expect(usage.detail).toBeUndefined();
    expect(usage.action).toBe("generate_site");
  });
});
