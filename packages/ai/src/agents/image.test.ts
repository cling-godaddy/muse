import { describe, it, expect } from "vitest";
import { parseImagePlan } from "./image";

describe("parseImagePlan", () => {
  it("parses valid JSON array", () => {
    const input = JSON.stringify([
      {
        blockId: "hero_1",
        category: "ambient",
        provider: "getty",
        searchQuery: "mountain landscape",
        orientation: "horizontal",
      },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      blockId: "hero_1",
      category: "ambient",
      provider: "getty",
      searchQuery: "mountain landscape",
      orientation: "horizontal",
    });
  });

  it("handles markdown code blocks", () => {
    const input = `\`\`\`json
[{"blockId": "hero_1", "category": "ambient", "provider": "pexels", "searchQuery": "office", "orientation": "horizontal"}]
\`\`\``;

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.blockId).toBe("hero_1");
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseImagePlan("not json")).toEqual([]);
    expect(parseImagePlan("{invalid}")).toEqual([]);
    expect(parseImagePlan("")).toEqual([]);
  });

  it("returns empty array for unrecognized JSON structures", () => {
    expect(parseImagePlan("{\"foo\": \"bar\"}")).toEqual([]);
    expect(parseImagePlan("\"string\"")).toEqual([]);
    expect(parseImagePlan("123")).toEqual([]);
  });

  it("parses {items: [...]} structured output format", () => {
    const input = JSON.stringify({
      items: [
        { blockId: "hero_1", category: "ambient", provider: "getty", searchQuery: "sunset", orientation: "horizontal" },
        { blockId: "gallery_1", category: "subject", provider: "getty", searchQuery: "food", orientation: "square" },
      ],
    });

    const result = parseImagePlan(input);

    expect(result).toHaveLength(2);
    expect(result.at(0)?.blockId).toBe("hero_1");
    expect(result.at(1)?.blockId).toBe("gallery_1");
  });

  it("parses {plan: [...]} wrapped format", () => {
    const input = JSON.stringify({
      plan: [
        { blockId: "hero_1", category: "ambient", provider: "getty", searchQuery: "mountain", orientation: "horizontal" },
      ],
    });

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.searchQuery).toBe("mountain");
  });

  it("parses single object format", () => {
    const input = JSON.stringify({
      blockId: "hero_1",
      category: "ambient",
      provider: "getty",
      searchQuery: "ocean waves",
      orientation: "horizontal",
    });

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.searchQuery).toBe("ocean waves");
  });

  it("filters out items with missing required fields", () => {
    const input = JSON.stringify([
      { blockId: "valid", category: "ambient", provider: "getty", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_category", provider: "getty", searchQuery: "test", orientation: "horizontal" },
      { category: "ambient", provider: "getty", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_query", category: "ambient", provider: "getty", orientation: "horizontal" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.blockId).toBe("valid");
  });

  it("handles multiple valid items", () => {
    const input = JSON.stringify([
      { blockId: "hero_1", category: "ambient", provider: "getty", searchQuery: "nature", orientation: "horizontal" },
      { blockId: "features_1", category: "subject", provider: "getty", searchQuery: "icon", orientation: "square" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(2);
  });

  it("preserves count field when present", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "getty", searchQuery: "food", orientation: "square", count: 4 },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("count", 4);
  });

  it("marks mixed orientation blocks with orientation='mixed'", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "getty", searchQuery: "wedding", orientation: "horizontal", count: 10 },
    ]);
    const mixedBlocks = new Set(["gallery_1"]);

    const result = parseImagePlan(input, mixedBlocks);

    expect(result).toHaveLength(1);
    expect(result[0]?.orientation).toBe("mixed");
    expect(result[0]?.count).toBe(10);
    expect(result[0]?.blockId).toBe("gallery_1");
  });

  it("does not mark blocks not in mixedOrientationBlocks", () => {
    const input = JSON.stringify([
      { blockId: "hero_1", category: "ambient", provider: "getty", searchQuery: "sunset", orientation: "horizontal", count: 1 },
      { blockId: "gallery_1", category: "subject", provider: "getty", searchQuery: "wedding", orientation: "horizontal", count: 10 },
    ]);
    const mixedBlocks = new Set(["gallery_1"]);

    const result = parseImagePlan(input, mixedBlocks);

    expect(result).toHaveLength(2);
    expect(result.find(r => r.blockId === "hero_1")?.orientation).toBe("horizontal");
    expect(result.find(r => r.blockId === "gallery_1")?.orientation).toBe("mixed");
  });

  it("handles empty mixedOrientationBlocks set", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "getty", searchQuery: "food", orientation: "horizontal", count: 10 },
    ]);

    const result = parseImagePlan(input, new Set());

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("count", 10);
    expect(result[0]).toHaveProperty("orientation", "horizontal");
  });
});
