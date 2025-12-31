import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Hero } from "@muse/editor";
import type { HeroBlock } from "@muse/core";

type HeroArgs = {
  headline: string
  subheadline: string
  ctaText: string
  alignment: "left" | "center" | "right"
  preset: string
  showBackgroundImage: boolean
};

const meta: Meta<HeroArgs> = {
  title: "Blocks/Hero",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    ctaText: { control: "text" },
    alignment: {
      control: "inline-radio",
      options: ["left", "center", "right"],
    },
    preset: {
      control: "select",
      options: ["hero-centered", "hero-overlay", "hero-split-left", "hero-split-right"],
    },
    showBackgroundImage: { control: "boolean" },
  },
  args: {
    headline: "Build Something Amazing",
    subheadline: "Create beautiful landing pages in minutes with our intuitive builder.",
    ctaText: "Get Started",
    alignment: "center",
    preset: "hero-centered",
    showBackgroundImage: false,
  },
  render: (args) => {
    const block: HeroBlock = {
      id: "story-hero",
      type: "hero",
      version: 1,
      headline: args.headline,
      subheadline: args.subheadline || undefined,
      cta: args.ctaText ? { text: args.ctaText, href: "#" } : undefined,
      alignment: args.alignment,
      preset: args.preset,
      backgroundImage: args.showBackgroundImage
        ? { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600", alt: "Background" }
        : undefined,
      backgroundOverlay: args.showBackgroundImage ? 0.5 : undefined,
    };
    return <Hero block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<HeroArgs>;

export const Centered: Story = {};

export const Overlay: Story = {
  args: { preset: "hero-overlay", showBackgroundImage: true },
};

export const SplitLeft: Story = {
  args: { preset: "hero-split-left", alignment: "left", showBackgroundImage: true },
};

export const SplitRight: Story = {
  args: { preset: "hero-split-right", alignment: "left", showBackgroundImage: true },
};
