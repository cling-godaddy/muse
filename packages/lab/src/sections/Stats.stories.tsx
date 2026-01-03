import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Stats } from "@muse/editor";
import type { StatsSection, StatItem } from "@muse/core";

const sampleStats: StatItem[] = [
  { value: "10", suffix: "K+", label: "Customers" },
  { value: "99", suffix: "%", label: "Uptime" },
  { value: "50", suffix: "M", label: "Requests/day" },
  { value: "24", suffix: "/7", label: "Support" },
];

type StatsArgs = {
  headline: string
  preset: string
  statCount: number
};

const meta: Meta<StatsArgs> = {
  title: "Sections/Stats",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    statCount: {
      control: { type: "range", min: 2, max: 4, step: 1 },
    },
  },
  args: {
    headline: "By the Numbers",
    preset: "stats-row",
    statCount: 4,
  },
  render: (args) => {
    const section: StatsSection = {
      id: "story-stats",
      type: "stats",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      stats: sampleStats.slice(0, args.statCount),
    };
    return <Stats section={section} onUpdate={console.log} />;
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
  args: { preset: "stats-grid" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/99/)).toBeVisible();
    await expect(canvas.getByText(/uptime/i)).toBeVisible();
  },
};

export const Counters: Story = {
  args: { preset: "stats-counters" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/requests/i)).toBeVisible();
  },
};
