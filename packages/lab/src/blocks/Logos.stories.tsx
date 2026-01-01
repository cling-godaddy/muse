import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logos } from "@muse/editor";
import type { LogosBlock, LogoItem } from "@muse/core";

const sampleLogos: LogoItem[] = [
  { image: { url: "https://logo.clearbit.com/google.com", alt: "Google" }, href: "#" },
  { image: { url: "https://logo.clearbit.com/microsoft.com", alt: "Microsoft" }, href: "#" },
  { image: { url: "https://logo.clearbit.com/amazon.com", alt: "Amazon" }, href: "#" },
  { image: { url: "https://logo.clearbit.com/apple.com", alt: "Apple" }, href: "#" },
  { image: { url: "https://logo.clearbit.com/meta.com", alt: "Meta" }, href: "#" },
  { image: { url: "https://logo.clearbit.com/netflix.com", alt: "Netflix" }, href: "#" },
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
      options: ["logos-row", "logos-grid", "logos-marquee"],
    },
    logoCount: {
      control: { type: "range", min: 3, max: 6, step: 1 },
    },
  },
  args: {
    headline: "Trusted By",
    preset: "logos-row",
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

export const Row: Story = {};

export const Grid: Story = {
  args: { preset: "logos-grid" },
};

export const Marquee: Story = {
  args: { preset: "logos-marquee" },
};
