import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Faq, type FaqVariant } from "@muse/sections";
import type { FaqItem } from "@muse/core";

const sampleItems: FaqItem[] = [
  { question: "How do I get started?", answer: "Simply sign up for a free account and follow our quick setup guide." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and bank transfers." },
  { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time with no questions asked." },
  { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial with full access to all features." },
  { question: "Do you offer refunds?", answer: "We offer a 30-day money-back guarantee on all plans." },
];

/** Renders FAQ content - section provides item wrapper */
function FaqContent({ item }: { item: FaqItem }) {
  return (
    <details style={{ width: "100%" }}>
      <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: "1rem" }}>
        {item.question}
      </summary>
      <p style={{ marginTop: "0.75rem", color: "#6b7280" }}>{item.answer}</p>
    </details>
  );
}

type FaqArgs = {
  headline: string
  subheadline: string
  variant: FaqVariant
  itemCount: number
};

const meta: Meta<FaqArgs> = {
  title: "Sections/FAQ",
  argTypes: {
    variant: {
      control: "select",
      options: ["accordion", "two-column"],
    },
    headline: { control: "text" },
    subheadline: { control: "text" },
    itemCount: {
      control: { type: "range", min: 2, max: 5, step: 1 },
    },
  },
  args: {
    headline: "Frequently Asked Questions",
    subheadline: "Everything you need to know",
    variant: "accordion",
    itemCount: 5,
  },
  render: (args) => {
    const items = sampleItems.slice(0, args.itemCount);
    return (
      <Faq
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        items={items.map((item, i) => <FaqContent key={i} item={item} />)}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<FaqArgs>;

export const Accordion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();
    await expect(canvas.getByText(/how do i get started/i)).toBeVisible();
    await expect(canvas.getByText(/what payment methods/i)).toBeVisible();
  },
};

export const TwoColumn: Story = {
  args: { variant: "two-column" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();
  },
};
