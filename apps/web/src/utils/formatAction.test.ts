import { describe, it, expect } from "vitest";
import { formatAction } from "./formatAction";

describe("formatAction", () => {
  it("formats generate_site", () => {
    expect(formatAction("generate_site")).toBe("Site Generation");
  });

  it("formats generate_section", () => {
    expect(formatAction("generate_section")).toBe("Section Generation");
  });

  it("formats generate_item", () => {
    expect(formatAction("generate_item")).toBe("Item Generation");
  });

  it("formats refine", () => {
    expect(formatAction("refine")).toBe("Refinement");
  });

  it("formats normalize_query", () => {
    expect(formatAction("normalize_query")).toBe("Query Normalization");
  });

  it("formats rewrite_text", () => {
    expect(formatAction("rewrite_text")).toBe("Text Rewrite");
  });

  it("returns Unknown for undefined", () => {
    expect(formatAction(undefined)).toBe("Unknown");
  });
});
