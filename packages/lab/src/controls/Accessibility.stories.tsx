import React, { useState, useRef, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import chroma from "chroma-js";
import {
  ColorPicker,
  getContrastRatio,
  meetsContrastThreshold,
  getNearestAccessibleColor,
  getNearestAccessibleColors,
  getAccessibilityCurve,
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
  const [threshold, setThreshold] = useState(CONTRAST_AA_NORMAL);
  const [count, setCount] = useState(5);
  const [spread, setSpread] = useState(10);

  const ratio = getContrastRatio(foreground, background);
  const passesNormal = meetsContrastThreshold(foreground, background, CONTRAST_AA_NORMAL);
  const passesLarge = meetsContrastThreshold(foreground, background, CONTRAST_AA_LARGE);
  const nearest = getNearestAccessibleColor(foreground, background, threshold);
  const alternatives = getNearestAccessibleColors(foreground, background, count, threshold, spread);

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* Left: Color pickers + controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Foreground</div>
          <ColorPicker value={foreground} onChange={setForeground} side="left" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Background</div>
          <ColorPicker value={background} onChange={setBackground} side="left" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Threshold</div>
          <select
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              width: "100%",
            }}
          >
            <option value={CONTRAST_AA_LARGE}>3:1 (Large text)</option>
            <option value={CONTRAST_AA_NORMAL}>4.5:1 (Normal text)</option>
            <option value={7}>7:1 (AAA)</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            Count:
            {" "}
            {count}
          </div>
          <input
            type="range"
            min={2}
            max={10}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            Spread:
            {" "}
            {spread}
            {" "}
            {spread === 0 ? "(clustered)" : `(${spread} sat jump)`}
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={spread}
            onChange={e => setSpread(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Right: Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
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

        {/* Accessible alternatives */}
        {nearest && (
          <div
            style={{
              padding: 12,
              background: "#fef3c7",
              borderRadius: 8,
              border: "1px solid #f59e0b",
              width: 320,
              minHeight: 100,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 11, color: "#92400e", marginBottom: 8 }}>
              Accessible alternatives (click to apply):
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {alternatives.map((color) => {
                const colorRatio = getContrastRatio(color, background);
                const isNearest = color === nearest;
                return (
                  <button
                    key={color}
                    onClick={() => setForeground(color)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      padding: 4,
                      background: "white",
                      border: isNearest ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    title={isNearest ? "Nearest (minimal change)" : "Click to apply"}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: color,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    <code style={{ fontSize: 9, color: "#374151" }}>{color}</code>
                    <div style={{ fontSize: 9, color: "#6b7280" }}>
                      {colorRatio.toFixed(1)}
                      :1
                    </div>
                    {isNearest && (
                      <div style={{ fontSize: 8, color: "#f59e0b", fontWeight: 600 }}>nearest</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ContrastChecker: StoryObj = {
  render: () => <ContrastDemo />,
};

/**
 * Canvas component that visualizes the accessibility curve in S/V space
 */
function AccessibilityCurveCanvas({
  hue,
  background,
  threshold,
  foregroundSat,
  foregroundVal,
  size = 256,
}: {
  hue: number
  background: string
  threshold: number
  foregroundSat: number // 0-100
  foregroundVal: number // 0-100
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the S/V gradient (clean, like the ColorPicker)
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const s = x / (size - 1); // saturation: 0-1
        const v = 1 - y / (size - 1); // value: 1-0 (top is bright)
        const [r, g, b] = chroma.hsv(hue, s, v).rgb();
        const i = (y * size + x) * 4;
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Get the accessibility curve
    const curve = getAccessibilityCurve(background, hue, threshold);
    const isBackgroundLight = chroma(background).luminance() > 0.5;

    // Draw the curve line (no dimming - cleaner visual)
    if (curve.length > 0) {
      // Shadow for visibility
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let s = 0; s < curve.length; s++) {
        const x = (s / 100) * size;
        const y = (1 - curve[s] / 100) * size;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // White line on top
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s < curve.length; s++) {
        const x = (s / 100) * size;
        const y = (1 - curve[s] / 100) * size;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Add "safe" indicator on the accessible side
      const labelX = 8;
      const labelY = isBackgroundLight ? size - 12 : 20;
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillText("✓ accessible", labelX + 1, labelY + 1);
      ctx.fillStyle = "white";
      ctx.fillText("✓ accessible", labelX, labelY);
    }

    // Draw marker for current foreground position
    const markerX = (foregroundSat / 100) * size;
    const markerY = (1 - foregroundVal / 100) * size;

    // Outer ring (shadow)
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner ring (white)
    ctx.beginPath();
    ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, background, threshold, foregroundSat, foregroundVal, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
    />
  );
}

function CurveVisualizerDemo() {
  const [foreground, setForeground] = useState("#6366f1");
  const [background, setBackground] = useState("#ffffff");
  const [threshold, setThreshold] = useState(CONTRAST_AA_NORMAL);

  const [hue, sat, val] = chroma(foreground).hsv();
  const normalizedHue = isNaN(hue) ? 0 : hue;
  const ratio = getContrastRatio(foreground, background);
  const passes = ratio >= threshold;

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* Left: Curve visualization */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AccessibilityCurveCanvas
          hue={normalizedHue}
          background={background}
          threshold={threshold}
          foregroundSat={sat * 100}
          foregroundVal={val * 100}
          size={320}
        />
        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          Hue:
          {" "}
          {Math.round(normalizedHue)}
          ° — Curve marks accessibility boundary
        </div>
      </div>

      {/* Right: Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Foreground</div>
          <ColorPicker value={foreground} onChange={setForeground} side="right" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Background</div>
          <ColorPicker value={background} onChange={setBackground} side="right" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Threshold</div>
          <select
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          >
            <option value={CONTRAST_AA_NORMAL}>4.5:1 (Normal)</option>
            <option value={CONTRAST_AA_LARGE}>3:1 (Large)</option>
            <option value={7}>7:1 (AAA)</option>
          </select>
        </div>
        <div
          style={{
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <div style={{ color: "#6b7280", marginBottom: 4 }}>Current ratio</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace" }}>
            <span style={{ color: passes ? "#16a34a" : "#dc2626" }}>
              {ratio.toFixed(2)}
              :1
              {" "}
              {passes ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CurveVisualizer: StoryObj = {
  render: () => <CurveVisualizerDemo />,
};
