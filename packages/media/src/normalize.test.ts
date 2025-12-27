import { describe, it, expect } from "vitest";
import { enforceRules, buildQueryString, STOPWORDS } from "./normalize";

describe("enforceRules", () => {
  it("lowercases phrases and terms", () => {
    const result = enforceRules({
      phrases: ["New York", "COFFEE SHOP"],
      terms: ["Warm", "COZY"],
    });

    expect(result.phrases).toEqual(["coffee shop", "new york"]);
    expect(result.terms).toEqual(["cozy", "warm"]);
  });

  it("deduplicates phrases and terms", () => {
    const result = enforceRules({
      phrases: ["sushi restaurant", "sushi restaurant", "coffee shop"],
      terms: ["warm", "warm", "cozy"],
    });

    expect(result.phrases).toEqual(["coffee shop", "sushi restaurant"]);
    expect(result.terms).toEqual(["cozy", "warm"]);
  });

  it("sorts alphabetically", () => {
    const result = enforceRules({
      phrases: ["zebra cafe", "alpha bar"],
      terms: ["zen", "ancient", "modern"],
    });

    expect(result.phrases).toEqual(["alpha bar", "zebra cafe"]);
    expect(result.terms).toEqual(["ancient", "modern", "zen"]);
  });

  it("caps phrases at 2", () => {
    const result = enforceRules({
      phrases: ["a phrase", "b phrase", "c phrase"],
      terms: [],
    });

    expect(result.phrases).toHaveLength(2);
    expect(result.phrases).toEqual(["a phrase", "b phrase"]);
  });

  it("caps terms at 8", () => {
    const result = enforceRules({
      phrases: [],
      terms: ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j10"],
    });

    expect(result.terms).toHaveLength(8);
    expect(result.terms).toEqual(["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8"]);
  });

  it("filters stopwords from terms", () => {
    const result = enforceRules({
      phrases: [],
      terms: ["warm", "the", "for", "cozy", "image", "photo"],
    });

    expect(result.terms).toEqual(["cozy", "warm"]);
  });

  it("filters empty strings", () => {
    const result = enforceRules({
      phrases: ["", "valid phrase", "  "],
      terms: ["", "valid", "   "],
    });

    expect(result.phrases).toEqual(["valid phrase"]);
    expect(result.terms).toEqual(["valid"]);
  });

  it("trims whitespace", () => {
    const result = enforceRules({
      phrases: ["  coffee shop  ", " sushi restaurant"],
      terms: ["  warm ", " cozy  "],
    });

    expect(result.phrases).toEqual(["coffee shop", "sushi restaurant"]);
    expect(result.terms).toEqual(["cozy", "warm"]);
  });

  it("handles empty input", () => {
    const result = enforceRules({ phrases: [], terms: [] });

    expect(result.phrases).toEqual([]);
    expect(result.terms).toEqual([]);
  });
});

describe("buildQueryString", () => {
  it("joins phrases and terms with commas", () => {
    const result = buildQueryString({
      phrases: ["sushi restaurant"],
      terms: ["warm", "cozy"],
    });

    expect(result).toBe("sushi restaurant, warm, cozy");
  });

  it("phrases come before terms", () => {
    const result = buildQueryString({
      phrases: ["coffee shop", "new york"],
      terms: ["modern"],
    });

    expect(result).toBe("coffee shop, new york, modern");
  });

  it("handles phrases only", () => {
    const result = buildQueryString({
      phrases: ["tech startup"],
      terms: [],
    });

    expect(result).toBe("tech startup");
  });

  it("handles terms only", () => {
    const result = buildQueryString({
      phrases: [],
      terms: ["professional", "team"],
    });

    expect(result).toBe("professional, team");
  });

  it("handles empty intent", () => {
    const result = buildQueryString({ phrases: [], terms: [] });

    expect(result).toBe("");
  });
});

describe("STOPWORDS", () => {
  it("contains common non-visual words", () => {
    expect(STOPWORDS.has("a")).toBe(true);
    expect(STOPWORDS.has("the")).toBe(true);
    expect(STOPWORDS.has("for")).toBe(true);
    expect(STOPWORDS.has("image")).toBe(true);
    expect(STOPWORDS.has("photo")).toBe(true);
    expect(STOPWORDS.has("hero")).toBe(true);
    expect(STOPWORDS.has("background")).toBe(true);
  });

  it("does not contain visual terms", () => {
    expect(STOPWORDS.has("warm")).toBe(false);
    expect(STOPWORDS.has("modern")).toBe(false);
    expect(STOPWORDS.has("cozy")).toBe(false);
  });
});
