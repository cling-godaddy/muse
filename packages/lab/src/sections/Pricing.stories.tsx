import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Pricing } from "@muse/sections";
import type { PricingSection, PricingPlan } from "@muse/core";

const samplePlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individuals",
    features: ["5 projects", "Basic analytics", "Email support"],
    cta: { text: "Start Free", href: "#" },
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams",
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "API access"],
    cta: { text: "Get Started", href: "#" },
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    features: ["Everything in Pro", "Custom integrations", "Dedicated support", "SLA guarantee"],
    cta: { text: "Contact Sales", href: "#" },
  },
];

type PricingArgs = {
  headline: string
  subheadline: string
  preset: string
  planCount: number
};

const meta: Meta<PricingArgs> = {
  title: "Sections/Pricing",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    subheadline: { control: "text" },
    planCount: {
      control: { type: "range", min: 2, max: 3, step: 1 },
    },
  },
  args: {
    headline: "Simple, Transparent Pricing",
    subheadline: "Choose the plan that works for you",
    preset: "pricing-cards",
    planCount: 3,
  },
  render: (args) => {
    const section: PricingSection = {
      id: "story-pricing",
      type: "pricing",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      plans: samplePlans.slice(0, args.planCount),
    };
    return <Pricing section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<PricingArgs>;

export const Cards: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /simple, transparent pricing/i })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: /starter/i })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: /^pro$/i })).toBeVisible();
  },
};
