import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Pricing } from "@muse/sections";
import type { PricingPlan } from "@muse/core";

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

/** Renders pricing plan content - section provides plan wrapper */
function PlanContent({ plan }: { plan: PricingPlan }) {
  return (
    <>
      <h3 style={{ fontFamily: "var(--muse-theme-heading-font)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muse-theme-text)" }}>{plan.name}</h3>
      <div style={{ fontFamily: "var(--muse-theme-body-font)", marginBottom: "0.5rem", color: "var(--muse-theme-text)" }}>
        <span style={{ fontSize: "2rem", fontWeight: 700 }}>{plan.price}</span>
        <span style={{ color: "var(--muse-theme-text-muted)" }}>{plan.period}</span>
      </div>
      {plan.description && (
        <p style={{ fontFamily: "var(--muse-theme-body-font)", fontSize: "0.875rem", color: "var(--muse-theme-text-muted)", marginBottom: "1rem" }}>{plan.description}</p>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", flex: 1 }}>
        {plan.features.map((feature, j) => (
          <li key={j} style={{ fontFamily: "var(--muse-theme-body-font)", padding: "0.25rem 0", fontSize: "0.875rem", color: "var(--muse-theme-text)" }}>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={plan.cta.href}
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.75rem",
          fontFamily: "var(--muse-theme-body-font)",
          background: "var(--muse-theme-primary)",
          color: "var(--muse-theme-on-primary)",
          borderRadius: "var(--muse-theme-radius)",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        {plan.cta.text}
      </a>
    </>
  );
}

type PricingArgs = {
  headline: string
  subheadline: string
  planCount: number
};

const meta: Meta<PricingArgs> = {
  title: "Sections/Pricing",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    planCount: {
      control: { type: "range", min: 2, max: 3, step: 1 },
    },
  },
  args: {
    headline: "Simple, Transparent Pricing",
    subheadline: "Choose the plan that works for you",
    planCount: 3,
  },
  render: (args) => {
    const plans = samplePlans.slice(0, args.planCount);
    return (
      <Pricing
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        plans={plans.map((plan, i) => <PlanContent key={i} plan={plan} />)}
      />
    );
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
