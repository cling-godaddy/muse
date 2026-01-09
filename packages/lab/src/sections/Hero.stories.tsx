import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Hero, type HeroVariant } from "@muse/sections";

type HeroArgs = {
  headline: string
  subheadline: string
  ctaText: string
  secondaryCtaText: string
  variant: HeroVariant
  overlayOpacity: number
  backgroundColor: string
};

const SAMPLE_IMAGE_URL = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600";

const meta: Meta<HeroArgs> = {
  title: "Sections/Hero",
  argTypes: {
    variant: {
      control: "select",
      options: ["centered", "split-left", "split-right", "overlay"],
    },
    headline: { control: "text" },
    subheadline: { control: "text" },
    ctaText: { control: "text" },
    secondaryCtaText: { control: "text" },
    backgroundColor: { control: "color" },
    overlayOpacity: {
      control: { type: "range", min: 0, max: 100, step: 10 },
      if: { arg: "variant", eq: "overlay" },
    },
  },
  args: {
    headline: "Build Something Amazing",
    subheadline: "Create beautiful landing pages in minutes with our intuitive builder.",
    ctaText: "Get Started",
    secondaryCtaText: "Learn More",
    variant: "centered",
    overlayOpacity: 50,
    backgroundColor: "#6366f1",
  },
  render: (args) => {
    const needsImage = args.variant !== "centered";
    return (
      <Hero
        headline={<h1>{args.headline}</h1>}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        cta={args.ctaText ? <a href="#">{args.ctaText}</a> : undefined}
        secondaryCta={args.secondaryCtaText ? <a href="#">{args.secondaryCtaText}</a> : undefined}
        image={needsImage ? <img src={SAMPLE_IMAGE_URL} alt="Hero" /> : undefined}
        backgroundImageUrl={args.variant === "overlay" ? SAMPLE_IMAGE_URL : undefined}
        overlayOpacity={args.overlayOpacity}
        variant={args.variant}
        backgroundColor={args.backgroundColor}
      />
    );
  },
};

export default meta;
type Story = StoryObj<HeroArgs>;

export const Centered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /get started/i })).toBeVisible();
  },
};

export const Overlay: Story = {
  args: { variant: "overlay" },
};

export const SplitLeft: Story = {
  args: { variant: "split-left" },
};

export const SplitRight: Story = {
  args: { variant: "split-right" },
};
