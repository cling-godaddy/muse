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

/** Renders pricing plan cards */
function PlanCards({ plans }: { plans: PricingPlan[] }) {
  return (
    <>
      {plans.map((plan, i) => (
        <div
          key={i}
          style={{
            padding: "1.5rem",
            background: plan.highlighted ? "#6366f1" : "#f9fafb",
            color: plan.highlighted ? "white" : "inherit",
            borderRadius: "0.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>{plan.name}</h3>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700 }}>{plan.price}</span>
            <span style={{ opacity: 0.7 }}>{plan.period}</span>
          </div>
          {plan.description && (
            <p style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: "1rem" }}>{plan.description}</p>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", flex: 1 }}>
            {plan.features.map((feature, j) => (
              <li key={j} style={{ padding: "0.25rem 0", fontSize: "0.875rem" }}>
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
              background: plan.highlighted ? "white" : "#6366f1",
              color: plan.highlighted ? "#6366f1" : "white",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {plan.cta.text}
          </a>
        </div>
      ))}
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
        plans={<PlanCards plans={plans} />}
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
