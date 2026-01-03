import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
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
    preset: { table: { disable: true } },
    headline: { control: "text" },
    subheadline: { control: "text" },
    buttonText: { control: "text" },
    placeholderText: { control: "text" },
    disclaimer: { control: "text" },
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

export const Inline: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/stay updated/i)).toBeVisible();
    await expect(canvas.getByRole("textbox")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /subscribe/i })).toBeVisible();
  },
};

export const Card: Story = {
  args: { preset: "subscribe-card" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /stay updated/i })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /subscribe/i })).toBeVisible();
  },
};

export const Banner: Story = {
  args: { preset: "subscribe-banner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /stay updated/i })).toBeVisible();
  },
};
