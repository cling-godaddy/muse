import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

const swatchStyle = (color: string): React.CSSProperties => ({
  width: 80,
  height: 80,
  borderRadius: "var(--muse-theme-radius, 8px)",
  background: color,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: 4,
  fontSize: 10,
  fontFamily: "monospace",
  color: "rgba(0,0,0,0.5)",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
});

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--muse-theme-text-muted)",
  marginTop: 4,
  textAlign: "center",
};

function Swatch({ name, cssVar }: { name: string, cssVar: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={swatchStyle(`var(${cssVar})`)} />
      <div style={labelStyle}>{name}</div>
    </div>
  );
}

function GradientSwatch({ name, cssVar }: { name: string, cssVar: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 200,
          height: 80,
          borderRadius: "var(--muse-theme-radius, 8px)",
          background: `var(${cssVar})`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
        }}
      />
      <div style={labelStyle}>{name}</div>
    </div>
  );
}

function PaletteDemo() {
  return (
    <div
      style={{
        padding: 32,
        background: "var(--muse-theme-bg)",
        minHeight: "100vh",
        fontFamily: "var(--muse-theme-body-font, system-ui)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--muse-theme-heading-font)",
          fontWeight: "var(--muse-theme-heading-weight)" as unknown as number,
          color: "var(--muse-theme-text)",
          marginBottom: 8,
        }}
      >
        Palette Demo
      </h1>
      <p style={{ color: "var(--muse-theme-text-muted)", marginBottom: 32 }}>
        Use the palette dropdown in the toolbar to see changes.
      </p>

      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--muse-theme-text)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Colors
      </h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <Swatch name="Primary" cssVar="--muse-theme-primary" />
        <Swatch name="Primary Hover" cssVar="--muse-theme-primary-hover" />
        <Swatch name="Accent" cssVar="--muse-theme-accent" />
        <Swatch name="Background" cssVar="--muse-theme-bg" />
        <Swatch name="Background Alt" cssVar="--muse-theme-bg-alt" />
        <Swatch name="Text" cssVar="--muse-theme-text" />
        <Swatch name="Text Muted" cssVar="--muse-theme-text-muted" />
        <Swatch name="CTA Background" cssVar="--muse-theme-cta-bg" />
        <Swatch name="CTA Text" cssVar="--muse-theme-cta-text" />
        <Swatch name="On Primary" cssVar="--muse-theme-on-primary" />
      </div>

      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--muse-theme-text)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Hero Gradient
      </h2>
      <div style={{ marginBottom: 32 }}>
        <GradientSwatch name="Hero Gradient" cssVar="--muse-theme-hero-gradient" />
      </div>

      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--muse-theme-text)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Sample Components
      </h2>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          padding: 24,
          background: "var(--muse-theme-bg-alt)",
          borderRadius: "var(--muse-theme-radius-lg)",
        }}
      >
        <button
          style={{
            padding: "12px 24px",
            background: "var(--muse-theme-cta-bg)",
            color: "var(--muse-theme-cta-text)",
            border: "none",
            borderRadius: "var(--muse-theme-radius)",
            fontFamily: "var(--muse-theme-body-font)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Primary Button
        </button>
        <button
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "var(--muse-theme-primary)",
            border: "2px solid var(--muse-theme-primary)",
            borderRadius: "var(--muse-theme-radius)",
            fontFamily: "var(--muse-theme-body-font)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Secondary Button
        </button>
        <div
          style={{
            padding: 16,
            background: "var(--muse-theme-bg)",
            borderRadius: "var(--muse-theme-radius)",
            boxShadow: "var(--muse-theme-shadow-card)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--muse-theme-text)" }}>Card Title</div>
          <div style={{ color: "var(--muse-theme-text-muted)", fontSize: 14 }}>
            Card description text
          </div>
        </div>
      </div>

      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--muse-theme-text)",
          marginBottom: 16,
          marginTop: 32,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Hero Preview
      </h2>
      <div
        style={{
          background: "var(--muse-theme-hero-gradient)",
          padding: 48,
          borderRadius: "var(--muse-theme-radius-lg)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--muse-theme-heading-font)",
            fontWeight: "var(--muse-theme-heading-weight)" as unknown as number,
            fontSize: 32,
            color: "var(--muse-theme-hero-text)",
            marginBottom: 8,
          }}
        >
          Hero Headline
        </h2>
        <p
          style={{
            color: "var(--muse-theme-hero-text-muted)",
            marginBottom: 24,
          }}
        >
          Supporting text on top of the hero gradient
        </p>
        <button
          style={{
            padding: "12px 24px",
            background: "white",
            color: "var(--muse-theme-primary)",
            border: "none",
            borderRadius: "var(--muse-theme-radius)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Call to Action
        </button>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Theme/Palette Demo",
  component: PaletteDemo,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
