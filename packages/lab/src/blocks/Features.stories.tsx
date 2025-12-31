import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Features } from "@muse/editor";
import type { FeaturesBlock, FeatureItem } from "@muse/core";

const sampleItems: FeatureItem[] = [
  { icon: "zap", title: "Lightning Fast", description: "Built for speed with optimized performance." },
  { icon: "shield", title: "Secure", description: "Enterprise-grade security for your data." },
  { icon: "code", title: "Developer Friendly", description: "Clean APIs and great documentation." },
  { icon: "globe", title: "Global Scale", description: "Deploy anywhere in the world." },
  { icon: "heart", title: "User Focused", description: "Designed with users in mind." },
  { icon: "settings", title: "Customizable", description: "Tailor everything to your needs." },
];

type FeaturesArgs = {
  headline: string
  columns: 2 | 3 | 4
  preset: string
  itemCount: number
};

const meta: Meta<FeaturesArgs> = {
  title: "Blocks/Features",
  argTypes: {
    headline: { control: "text" },
    columns: {
      control: "inline-radio",
      options: [2, 3, 4],
    },
    preset: {
      control: "select",
      options: ["features-grid-icons", "features-grid-cards", "features-alternating", "features-numbered"],
    },
    itemCount: {
      control: { type: "range", min: 2, max: 6, step: 1 },
    },
  },
  args: {
    headline: "Why Choose Us",
    columns: 3,
    preset: "features-grid-icons",
    itemCount: 6,
  },
  render: (args) => {
    const block: FeaturesBlock = {
      id: "story-features",
      type: "features",
      version: 1,
      headline: args.headline || undefined,
      columns: args.columns,
      preset: args.preset,
      items: sampleItems.slice(0, args.itemCount),
    };
    return <Features block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<FeaturesArgs>;

export const GridIcons: Story = {};

export const GridCards: Story = {
  args: { preset: "features-grid-cards" },
};

export const Alternating: Story = {
  args: { preset: "features-alternating", itemCount: 3 },
};

export const Numbered: Story = {
  args: { preset: "features-numbered", itemCount: 4 },
};
