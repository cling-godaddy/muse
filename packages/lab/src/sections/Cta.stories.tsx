import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Cta, type CtaVariant } from "@muse/sections";

type CtaArgs = {
  headline: string
  description: string
  buttonText: string
  variant: CtaVariant
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
  },
  args: {
    headline: "Ready to Get Started?",
    description: "Join thousands of satisfied customers today.",
    buttonText: "Start Now",
    variant: "primary",
  },
  render: (args) => {
    return (
      <Cta
        headline={<h2>{args.headline}</h2>}
        description={args.description ? <p>{args.description}</p> : undefined}
        button={<a href="#" style={{ padding: "0.75rem 1.5rem", background: "#6366f1", color: "white", borderRadius: "0.375rem", textDecoration: "none" }}>{args.buttonText}</a>}
        variant={args.variant}
      />
    );
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
