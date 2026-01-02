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

const sampleItemsWithImages: FeatureItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", alt: "Analytics dashboard" }, title: "Real-time Analytics", description: "Track performance metrics as they happen." },
  { image: { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600", alt: "Team collaboration" }, title: "Team Collaboration", description: "Work together seamlessly across time zones." },
  { image: { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600", alt: "Cloud infrastructure" }, title: "Cloud Native", description: "Built for modern cloud infrastructure." },
  { image: { url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600", alt: "Code editor" }, title: "Developer Tools", description: "Powerful APIs and SDKs for every platform." },
  { image: { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600", alt: "Security" }, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption." },
  { image: { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", alt: "Data visualization" }, title: "Smart Insights", description: "AI-powered recommendations and forecasting." },
];

type FeaturesArgs = {
  headline: string
  preset: string
  itemCount: number
};

const meta: Meta<FeaturesArgs> = {
  title: "Sections/Features",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
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
    const section: FeaturesSection = {
      id: "story-features",
      type: "features",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      items: sampleItems.slice(0, args.itemCount),
    };
    return <Features section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<FeaturesArgs>;

export const Grid: Story = {};

export const GridImages: Story = {
  args: {
    headline: "Everything You Need",
    preset: "features-grid-images",
    itemCount: 6,
  },
  render: (args) => {
    const section: FeaturesSection = {
      id: "story-features",
      type: "features",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      items: sampleItemsWithImages.slice(0, args.itemCount),
    };
    return <Features section={section} onUpdate={console.log} />;
  },
};

export const Bento: Story = {
  args: {
    headline: "Platform Highlights",
    preset: "features-bento",
    itemCount: 6,
  },
  render: (args) => {
    const section: FeaturesSection = {
      id: "story-features",
      type: "features",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      items: sampleItemsWithImages.slice(0, args.itemCount),
    };
    return <Features section={section} onUpdate={console.log} />;
  },
};

export const Numbered: Story = {
  args: {
    headline: "How It Works",
    preset: "features-numbered",
    itemCount: 4,
  },
};
