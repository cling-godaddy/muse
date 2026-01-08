import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime } from "./formatTime";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for less than a minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:30Z"));
    expect(formatRelativeTime("2024-01-15T12:00:00Z")).toBe("just now");
  });

  it("returns minutes ago for less than an hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:05:00Z"));
    expect(formatRelativeTime("2024-01-15T12:00:00Z")).toBe("5m ago");
  });

  it("returns hours ago for less than a day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T15:00:00Z"));
    expect(formatRelativeTime("2024-01-15T12:00:00Z")).toBe("3h ago");
  });

  it("returns days ago for less than a week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-18T12:00:00Z"));
    expect(formatRelativeTime("2024-01-15T12:00:00Z")).toBe("3d ago");
  });

  it("returns localized date for more than a week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-25T12:00:00Z"));
    const result = formatRelativeTime("2024-01-15T12:00:00Z");
    // toLocaleDateString format varies by locale, just check it's not a relative format
    expect(result).not.toContain("ago");
    expect(result).not.toBe("just now");
  });
});
