import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logos } from "@muse/editor";
import type { LogosBlock, LogoItem } from "@muse/core";

function makeLogo(name: string, color: string): LogoItem {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="${color}"/><text x="60" y="25" text-anchor="middle" fill="white" font-family="system-ui" font-size="14" font-weight="600">${name}</text></svg>`;
  return { image: { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: name }, href: "#" };
}

const sampleLogos: LogoItem[] = [
  makeLogo("Acme", "#3b82f6"),
  makeLogo("Globex", "#8b5cf6"),
  makeLogo("Initech", "#06b6d4"),
  makeLogo("Hooli", "#f59e0b"),
  makeLogo("Stark", "#ef4444"),
  makeLogo("Wayne", "#1e293b"),
  makeLogo("Umbrella", "#10b981"),
  makeLogo("Cyberdyne", "#6366f1"),
];

type LogosArgs = {
  headline: string
  preset: string
  logoCount: number
};

const meta: Meta<LogosArgs> = {
  title: "Sections/Logos",
  argTypes: {
    headline: { control: "text" },
    preset: {
      control: "select",
      options: ["logos-grid", "logos-marquee"],
    },
    logoCount: {
      control: { type: "range", min: 3, max: 8, step: 1 },
    },
  },
  args: {
    headline: "Trusted By",
    preset: "logos-grid",
    logoCount: 6,
  },
  render: (args) => {
    const block: LogosBlock = {
      id: "story-logos",
      type: "logos",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      logos: sampleLogos.slice(0, args.logoCount),
    };
    return <Logos block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<LogosArgs>;

export const Grid: Story = {};

export const Marquee: Story = {
  args: { preset: "logos-marquee", logoCount: 8 },
};
