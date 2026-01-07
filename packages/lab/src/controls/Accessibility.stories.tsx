import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ColorPicker,
  getContrastRatio,
  meetsContrastThreshold,
  getNearestAccessibleColor,
  CONTRAST_AA_NORMAL,
  CONTRAST_AA_LARGE,
} from "@muse/editor";

const meta: Meta = {
  title: "Controls/Accessibility",
  parameters: {
    layout: "centered",
  },
};

export default meta;

function ContrastDemo() {
  const [foreground, setForeground] = useState("#6366f1");
  const [background, setBackground] = useState("#ffffff");

  const ratio = getContrastRatio(foreground, background);
  const passesNormal = meetsContrastThreshold(foreground, background, CONTRAST_AA_NORMAL);
  const passesLarge = meetsContrastThreshold(foreground, background, CONTRAST_AA_LARGE);
  const suggestion = getNearestAccessibleColor(foreground, background);

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* Left: Color pickers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Foreground</div>
          <ColorPicker value={foreground} onChange={setForeground} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Background</div>
          <ColorPicker value={background} onChange={setBackground} />
        </div>
      </div>

      {/* Right: Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 280 }}>
        <div
          style={{
            padding: 24,
            backgroundColor: background,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ color: foreground, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Sample Text
          </div>
          <div style={{ color: foreground, fontSize: 14 }}>
            The quick brown fox jumps over the lazy dog.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Contrast Ratio</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace" }}>
              {ratio.toFixed(2)}
              :1
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>WCAG AA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              <span style={{ color: passesNormal ? "#16a34a" : "#dc2626" }}>
                {passesNormal ? "✓" : "✗"}
                {" "}
                Normal text (4.5:1)
              </span>
              <span style={{ color: passesLarge ? "#16a34a" : "#dc2626" }}>
                {passesLarge ? "✓" : "✗"}
                {" "}
                Large text (3:1)
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            background: "#fef3c7",
            borderRadius: 8,
            border: "1px solid #f59e0b",
            visibility: suggestion ? "visible" : "hidden",
          }}
        >
          <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>
            Suggested accessible color:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: suggestion ?? "transparent",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
              }}
            />
            <div>
              <code style={{ fontSize: 14, fontWeight: 600 }}>{suggestion ?? "#000000"}</code>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Ratio:
                {" "}
                {suggestion ? getContrastRatio(suggestion, background).toFixed(2) : "0.00"}
                :1
              </div>
            </div>
            <button
              onClick={() => suggestion && setForeground(suggestion)}
              style={{
                marginLeft: "auto",
                padding: "6px 12px",
                fontSize: 13,
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ContrastChecker: StoryObj = {
  render: () => <ContrastDemo />,
};
