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

/** Renders stat items as cards */
function StatCards({ stats }: { stats: StatItem[] }) {
  return (
    <>
      {stats.map((stat, i) => (
        <div key={i} style={{ textAlign: "center", padding: "1rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#6366f1" }}>{stat.value}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>{stat.label}</div>
        </div>
      ))}
    </>
  );
}

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
    return (
      <Stats
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        stats={<StatCards stats={stats} />}
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
