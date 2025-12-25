import { describe, it, expect } from "vitest";
import { parseImagePlan } from "./image";

describe("parseImagePlan", () => {
  it("parses valid JSON array", () => {
    const input = JSON.stringify([
      {
        blockId: "hero_1",
        placement: "background",
        provider: "unsplash",
        searchQuery: "mountain landscape",
        orientation: "horizontal",
      },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      blockId: "hero_1",
      placement: "background",
      provider: "unsplash",
      searchQuery: "mountain landscape",
      orientation: "horizontal",
    });
  });

  it("handles markdown code blocks", () => {
    const input = `\`\`\`json
[{"blockId": "hero_1", "placement": "background", "provider": "pexels", "searchQuery": "office", "orientation": "horizontal"}]
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

  it("returns empty array for non-array JSON", () => {
    expect(parseImagePlan("{\"foo\": \"bar\"}")).toEqual([]);
    expect(parseImagePlan("\"string\"")).toEqual([]);
    expect(parseImagePlan("123")).toEqual([]);
  });

  it("filters out items with missing required fields", () => {
    const input = JSON.stringify([
      { blockId: "valid", placement: "background", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_placement", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { placement: "background", provider: "unsplash", searchQuery: "test", orientation: "horizontal" },
      { blockId: "missing_query", placement: "background", provider: "unsplash", orientation: "horizontal" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(1);
    expect(result.at(0)?.blockId).toBe("valid");
  });

  it("handles multiple valid items", () => {
    const input = JSON.stringify([
      { blockId: "hero_1", placement: "background", provider: "unsplash", searchQuery: "nature", orientation: "horizontal" },
      { blockId: "features_1", placement: "feature", provider: "pexels", searchQuery: "icon", orientation: "square" },
    ]);

    const result = parseImagePlan(input);

    expect(result).toHaveLength(2);
  });
});
