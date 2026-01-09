import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Cta } from "@muse/sections";
import type { CtaSection } from "@muse/core";

type CtaArgs = {
  headline: string
  description: string
  buttonText: string
  variant: "primary" | "secondary"
  preset: string
};

const meta: Meta<CtaArgs> = {
  title: "Sections/CTA",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    description: { control: "text" },
    buttonText: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary"],
    },
  },
  args: {
    headline: "Ready to Get Started?",
    description: "Join thousands of satisfied customers today.",
    buttonText: "Start Now",
    variant: "primary",
    preset: "cta-centered",
  },
  render: (args) => {
    const section: CtaSection = {
      id: "story-cta",
      type: "cta",
      version: 1,
      headline: args.headline,
      description: args.description || undefined,
      buttonText: args.buttonText,
      buttonHref: "#",
      variant: args.variant,
      preset: args.preset,
    };
    return <Cta section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<CtaArgs>;

export const Centered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /ready to get started/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /start now/i })).toBeVisible();
  },
};
