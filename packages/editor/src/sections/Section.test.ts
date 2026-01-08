import { describe, it, expect } from "vitest";

// Test the background color logic extracted from Section component
function getDisplayColor(
  section: { backgroundColor?: string, backgroundImage?: unknown },
  pendingColor: string | null,
): string | undefined {
  const hasBackgroundImage = "backgroundImage" in section && section.backgroundImage != null;
  const propColor = section.backgroundColor ?? "#ffffff";
  return hasBackgroundImage ? undefined : (pendingColor ?? propColor);
}

describe("Section background color logic", () => {
  it("returns undefined when section has backgroundImage", () => {
    const section = {
      backgroundColor: "#f5f5f4",
      backgroundImage: { url: "https://example.com/image.jpg" },
    };
    expect(getDisplayColor(section, null)).toBe(undefined);
  });

  it("returns backgroundColor when section has no backgroundImage", () => {
    const section = { backgroundColor: "#f5f5f4" };
    expect(getDisplayColor(section, null)).toBe("#f5f5f4");
  });

  it("returns pendingColor over backgroundColor when no backgroundImage", () => {
    const section = { backgroundColor: "#f5f5f4" };
    expect(getDisplayColor(section, "#000000")).toBe("#000000");
  });

  it("returns default white when no backgroundColor and no backgroundImage", () => {
    const section = {};
    expect(getDisplayColor(section, null)).toBe("#ffffff");
  });

  it("ignores pendingColor when section has backgroundImage", () => {
    const section = {
      backgroundColor: "#f5f5f4",
      backgroundImage: { url: "https://example.com/image.jpg" },
    };
    expect(getDisplayColor(section, "#000000")).toBe(undefined);
  });
});
