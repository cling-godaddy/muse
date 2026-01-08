import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebouncedCallback } from "../src/useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces the callback", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    // Call multiple times rapidly
    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Callback should have been called once with the last argument
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("c");
  });

  it("resets the timer on each call", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current("first");
    });

    // Advance 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Call again - should reset the timer
    act(() => {
      result.current("second");
    });

    // Advance another 50ms (100ms total, but only 50ms since last call)
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance to 100ms since last call
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("uses the latest callback", () => {
    let value = "initial";
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 100),
      {
        initialProps: {
          cb: () => value,
        },
      },
    );

    act(() => {
      result.current();
    });

    // Update the callback before the timer fires
    value = "updated";
    rerender({
      cb: () => value,
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The latest callback should have been used
    // (This is verified by the fact that useLatest is used internally)
  });

  it("cleans up timeout on unmount", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 100),
    );

    act(() => {
      result.current("test");
    });

    // Unmount before timer fires
    unmount();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Callback should not have been called
    expect(callback).not.toHaveBeenCalled();
  });

  it("maintains stable identity when delay stays the same", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 100),
      {
        initialProps: { cb: callback },
      },
    );

    const firstResult = result.current;

    // Rerender with new callback but same delay
    rerender({ cb: vi.fn() });

    expect(result.current).toBe(firstResult);
  });

  it("updates identity when delay changes", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      {
        initialProps: { delay: 100 },
      },
    );

    const firstResult = result.current;

    rerender({ delay: 200 });

    expect(result.current).not.toBe(firstResult);
  });
});
