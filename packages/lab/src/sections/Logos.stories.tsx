import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Logos } from "@muse/sections";
import type { LogosSection, LogoItem } from "@muse/core";

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
    preset: { table: { disable: true } },
    headline: { control: "text" },
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
    const section: LogosSection = {
      id: "story-logos",
      type: "logos",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      logos: sampleLogos.slice(0, args.logoCount),
    };
    return <Logos section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<LogosArgs>;

export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /trusted by/i })).toBeVisible();
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};

export const Marquee: Story = {
  args: { preset: "logos-marquee", logoCount: 8 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};
