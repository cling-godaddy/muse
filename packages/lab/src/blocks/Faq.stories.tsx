import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Faq } from "@muse/editor";
import type { FaqSection, FaqItem } from "@muse/core";

const sampleItems: FaqItem[] = [
  { question: "How do I get started?", answer: "Simply sign up for a free account and follow our quick setup guide." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and bank transfers." },
  { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time with no questions asked." },
  { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial with full access to all features." },
  { question: "Do you offer refunds?", answer: "We offer a 30-day money-back guarantee on all plans." },
];

type FaqArgs = {
  headline: string
  subheadline: string
  preset: string
  itemCount: number
};

const meta: Meta<FaqArgs> = {
  title: "Sections/FAQ",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    preset: {
      control: "select",
      options: ["faq-accordion", "faq-two-column"],
    },
    itemCount: {
      control: { type: "range", min: 2, max: 5, step: 1 },
    },
  },
  args: {
    headline: "Frequently Asked Questions",
    subheadline: "Everything you need to know",
    preset: "faq-accordion",
    itemCount: 5,
  },
  render: (args) => {
    const block: FaqSection = {
      id: "story-faq",
      type: "faq",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleItems.slice(0, args.itemCount),
    };
    return <Faq block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<FaqArgs>;

export const Accordion: Story = {};

export const TwoColumn: Story = {
  args: { preset: "faq-two-column" },
};
