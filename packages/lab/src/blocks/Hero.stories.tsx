import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hero } from "@muse/editor";
import type { HeroSection } from "@muse/core";

type HeroArgs = {
  headline: string
  subheadline: string
  ctaText: string
  secondaryCtaText: string
  preset: string
  overlayOpacity: number
};

const SAMPLE_IMAGE = {
  url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
  alt: "Mountain landscape",
};

const meta: Meta<HeroArgs> = {
  title: "Sections/Hero",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    ctaText: { control: "text" },
    secondaryCtaText: { control: "text" },
    preset: {
      control: "select",
      options: ["hero-centered", "hero-overlay", "hero-split-left", "hero-split-right"],
    },
    overlayOpacity: {
      control: { type: "range", min: 0, max: 100, step: 10 },
      if: { arg: "preset", eq: "hero-overlay" },
    },
  },
  args: {
    headline: "Build Something Amazing",
    subheadline: "Create beautiful landing pages in minutes with our intuitive builder.",
    ctaText: "Get Started",
    secondaryCtaText: "Learn More",
    preset: "hero-centered",
    overlayOpacity: 50,
  },
  render: (args) => {
    const needsImage = args.preset !== "hero-centered";
    const section: HeroSection = {
      id: "story-hero",
      type: "hero",
      version: 1,
      headline: args.headline,
      subheadline: args.subheadline || undefined,
      cta: args.ctaText ? { text: args.ctaText, href: "#" } : undefined,
      secondaryCta: args.secondaryCtaText ? { text: args.secondaryCtaText, href: "#" } : undefined,
      preset: args.preset,
      backgroundImage: needsImage ? SAMPLE_IMAGE : undefined,
      backgroundOverlay: args.preset === "hero-overlay" ? args.overlayOpacity : undefined,
    };
    return <Hero section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<HeroArgs>;

export const Centered: Story = {};

export const Overlay: Story = {
  args: { preset: "hero-overlay" },
};

export const SplitLeft: Story = {
  args: { preset: "hero-split-left" },
};

export const SplitRight: Story = {
  args: { preset: "hero-split-right" },
};
