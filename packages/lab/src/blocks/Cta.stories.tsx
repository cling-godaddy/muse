import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cta } from "@muse/editor";
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
    headline: { control: "text" },
    description: { control: "text" },
    buttonText: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary"],
    },
    preset: {
      control: "select",
      options: ["cta-centered"],
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
    const block: CtaSection = {
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
    return <Cta block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<CtaArgs>;

export const Centered: Story = {};
