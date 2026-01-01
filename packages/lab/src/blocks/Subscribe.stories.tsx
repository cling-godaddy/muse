import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Subscribe } from "@muse/editor";
import type { SubscribeSection } from "@muse/core";

type SubscribeArgs = {
  headline: string
  subheadline: string
  buttonText: string
  placeholderText: string
  disclaimer: string
  preset: string
};

const meta: Meta<SubscribeArgs> = {
  title: "Sections/Subscribe",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    buttonText: { control: "text" },
    placeholderText: { control: "text" },
    disclaimer: { control: "text" },
    preset: {
      control: "select",
      options: ["subscribe-inline", "subscribe-card", "subscribe-banner"],
    },
  },
  args: {
    headline: "Stay Updated",
    subheadline: "Get the latest news and updates delivered to your inbox.",
    buttonText: "Subscribe",
    placeholderText: "Enter your email",
    disclaimer: "We respect your privacy. Unsubscribe at any time.",
    preset: "subscribe-inline",
  },
  render: (args) => {
    const section: SubscribeSection = {
      id: "story-subscribe",
      type: "subscribe",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      buttonText: args.buttonText,
      placeholderText: args.placeholderText || undefined,
      disclaimer: args.disclaimer || undefined,
      preset: args.preset,
    };
    return <Subscribe section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<SubscribeArgs>;

export const Inline: Story = {};

export const Card: Story = {
  args: { preset: "subscribe-card" },
};

export const Banner: Story = {
  args: { preset: "subscribe-banner" },
};
