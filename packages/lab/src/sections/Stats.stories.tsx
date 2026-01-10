import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Stats, type StatsVariant } from "@muse/sections";
import type { StatItem } from "@muse/core";

const sampleStats: StatItem[] = [
  { value: "10K+", label: "Customers" },
  { value: "99%", label: "Uptime" },
  { value: "50M", label: "Requests/day" },
  { value: "24/7", label: "Support" },
];

type StatsArgs = {
  headline: string
  variant: StatsVariant
  statCount: number
};

const meta: Meta<StatsArgs> = {
  title: "Sections/Stats",
  argTypes: {
    variant: {
      control: "select",
      options: ["row", "grid", "counters"],
    },
    headline: { control: "text" },
    statCount: {
      control: { type: "range", min: 2, max: 4, step: 1 },
    },
  },
  args: {
    headline: "By the Numbers",
    variant: "row",
    statCount: 4,
  },
  render: (args) => {
    const stats = sampleStats.slice(0, args.statCount);
    const animate = args.variant === "counters";
    return (
      <Stats
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        stats={stats.map((stat, i) => (
          <React.Fragment key={i}>
            <Stats.Value animate={animate}>{stat.value}</Stats.Value>
            <Stats.Label>{stat.label}</Stats.Label>
          </React.Fragment>
        ))}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<StatsArgs>;

export const Row: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /by the numbers/i })).toBeVisible();
    await expect(canvas.getByText(/10/)).toBeVisible();
    await expect(canvas.getByText(/customers/i)).toBeVisible();
  },
};

export const Grid: Story = {
  args: { variant: "grid" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/99/)).toBeVisible();
    await expect(canvas.getByText(/uptime/i)).toBeVisible();
  },
};

export const Counters: Story = {
  args: { variant: "counters" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/requests/i)).toBeVisible();
  },
};
