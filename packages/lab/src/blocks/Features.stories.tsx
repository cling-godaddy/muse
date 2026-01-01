import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Features } from "@muse/editor";
import type { FeaturesSection, FeatureItem } from "@muse/core";

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
  preset: string
  itemCount: number
};

const meta: Meta<FeaturesArgs> = {
  title: "Sections/Features",
  argTypes: {
    headline: { control: "text" },
    preset: {
      control: "select",
      options: ["features-grid", "features-numbered"],
    },
    itemCount: {
      control: { type: "range", min: 2, max: 6, step: 1 },
    },
  },
  args: {
    headline: "Why Choose Us",
    preset: "features-grid",
    itemCount: 6,
  },
  render: (args) => {
    const block: FeaturesSection = {
      id: "story-features",
      type: "features",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      items: sampleItems.slice(0, args.itemCount),
    };
    return <Features block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<FeaturesArgs>;

export const Grid: Story = {};

export const Numbered: Story = {
  args: {
    headline: "How It Works",
    preset: "features-numbered",
    itemCount: 4,
  },
};
