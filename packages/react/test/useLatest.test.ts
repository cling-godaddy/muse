import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useLatest } from "../src/useLatest";

describe("useLatest", () => {
  it("returns a ref with the initial value", () => {
    const { result } = renderHook(() => useLatest("initial"));
    expect(result.current.current).toBe("initial");
  });

  it("updates the ref when value changes", () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: "first" },
    });

    expect(result.current.current).toBe("first");

    rerender({ value: "second" });
    expect(result.current.current).toBe("second");

    rerender({ value: "third" });
    expect(result.current.current).toBe("third");
  });

  it("maintains ref identity across renders", () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 1 },
    });

    const firstRef = result.current;

    rerender({ value: 2 });
    expect(result.current).toBe(firstRef);

    rerender({ value: 3 });
    expect(result.current).toBe(firstRef);
  });

  it("works with objects", () => {
    const obj1 = { name: "Alice" };
    const obj2 = { name: "Bob" };

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current.current).toBe(obj1);

    rerender({ value: obj2 });
    expect(result.current.current).toBe(obj2);
  });

  it("works with functions", () => {
    const fn1 = () => "first";
    const fn2 = () => "second";

    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: fn1 },
    });

    expect(result.current.current).toBe(fn1);
    expect(result.current.current()).toBe("first");

    rerender({ value: fn2 });
    expect(result.current.current).toBe(fn2);
    expect(result.current.current()).toBe("second");
  });
});
