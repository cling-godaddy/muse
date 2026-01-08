import { describe, it, expect } from "vitest";

// Test the hasBackgroundImage logic (used for hiding ColorPicker)
function hasBackgroundImage(section: { backgroundImage?: unknown }): boolean {
  return "backgroundImage" in section && section.backgroundImage != null;
}

// Test the colorPickerValue logic
function getColorPickerValue(
  section: { backgroundColor?: string },
  pendingColor: string | null,
): string {
  return pendingColor ?? section.backgroundColor ?? "#ffffff";
}

describe("Section background color logic", () => {
  describe("hasBackgroundImage", () => {
    it("returns true when section has backgroundImage", () => {
      const section = { backgroundImage: { url: "https://example.com/image.jpg" } };
      expect(hasBackgroundImage(section)).toBe(true);
    });

    it("returns false when section has no backgroundImage", () => {
      const section = {};
      expect(hasBackgroundImage(section)).toBe(false);
    });

    it("returns false when backgroundImage is null", () => {
      const section = { backgroundImage: null };
      expect(hasBackgroundImage(section)).toBe(false);
    });
  });

  describe("getColorPickerValue", () => {
    it("returns backgroundColor when set", () => {
      const section = { backgroundColor: "#f5f5f4" };
      expect(getColorPickerValue(section, null)).toBe("#f5f5f4");
    });

    it("returns pendingColor over backgroundColor", () => {
      const section = { backgroundColor: "#f5f5f4" };
      expect(getColorPickerValue(section, "#000000")).toBe("#000000");
    });

    it("returns default white when no backgroundColor", () => {
      const section = {};
      expect(getColorPickerValue(section, null)).toBe("#ffffff");
    });
  });
});
