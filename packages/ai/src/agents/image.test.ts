import { describe, it, expect } from "vitest";
import { parseImagePlan } from "./image";

describe("parseImagePlan", () => {
  it("parses valid JSON array", () => {
    const input = JSON.stringify([
      {
        blockId: "hero_1",
        category: "ambient",
        provider: "unsplash",
        searchQuery: "mountain landscape",
        orientation: "horizontal",
      },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      blockId: "hero_1",
      category: "ambient",
      provider: "unsplash",
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
        { blockId: "hero_1", category: "ambient", provider: "unsplash", searchQuery: "sunset", orientation: "horizontal" },
        { blockId: "gallery_1", category: "subject", provider: "pexels", searchQuery: "food", orientation: "square" },
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
        { blockId: "hero_1", category: "ambient", provider: "unsplash", searchQuery: "mountain", orientation: "horizontal" },
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
      provider: "unsplash",
      searchQuery: "ocean waves",
      orientation: "horizontal",
    });

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.searchQuery).toBe("ocean waves");
  });

  it("filters out items with missing required fields", () => {
    const input = JSON.stringify([
      { blockId: "valid", category: "ambient", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_category", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { category: "ambient", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_query", category: "ambient", provider: "unsplash", orientation: "horizontal" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.blockId).toBe("valid");
  });

  it("handles multiple valid items", () => {
    const input = JSON.stringify([
      { blockId: "hero_1", category: "ambient", provider: "unsplash", searchQuery: "nature", orientation: "horizontal" },
      { blockId: "features_1", category: "subject", provider: "pexels", searchQuery: "icon", orientation: "square" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(2);
  });

  it("preserves count field when present", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "unsplash", searchQuery: "food", orientation: "square", count: 4 },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("count", 4);
  });

  it("expands mixed orientation blocks into separate items", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "unsplash", searchQuery: "wedding", orientation: "horizontal", count: 9 },
    ]);
    const mixedBlocks = new Set(["gallery_1"]);

    const result = parseImagePlan(input, mixedBlocks);

    // 9 images / 3 orientations = 3 per orientation = 9 items total
    expect(result).toHaveLength(9);
    expect(result.every(r => r.count === 1)).toBe(true);
    expect(result.every(r => r.blockId === "gallery_1")).toBe(true);

    // Should have mix of orientations
    const orientations = result.map(r => r.orientation);
    expect(orientations.filter(o => o === "horizontal")).toHaveLength(3);
    expect(orientations.filter(o => o === "vertical")).toHaveLength(3);
    expect(orientations.filter(o => o === "square")).toHaveLength(3);
  });

  it("does not expand blocks not in mixedOrientationBlocks", () => {
    const input = JSON.stringify([
      { blockId: "hero_1", category: "ambient", provider: "unsplash", searchQuery: "sunset", orientation: "horizontal", count: 1 },
      { blockId: "gallery_1", category: "subject", provider: "unsplash", searchQuery: "wedding", orientation: "horizontal", count: 9 },
    ]);
    const mixedBlocks = new Set(["gallery_1"]);

    const result = parseImagePlan(input, mixedBlocks);

    // hero_1 stays as 1 item, gallery_1 expands to 9
    expect(result).toHaveLength(10);
    expect(result.filter(r => r.blockId === "hero_1")).toHaveLength(1);
    expect(result.filter(r => r.blockId === "gallery_1")).toHaveLength(9);
  });

  it("handles empty mixedOrientationBlocks set", () => {
    const input = JSON.stringify([
      { blockId: "gallery_1", category: "subject", provider: "unsplash", searchQuery: "food", orientation: "horizontal", count: 9 },
    ]);

    const result = parseImagePlan(input, new Set());

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("count", 9);
  });
});
