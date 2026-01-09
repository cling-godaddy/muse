import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Subscribe, type SubscribeVariant } from "@muse/sections";

type SubscribeArgs = {
  headline: string
  subheadline: string
  buttonText: string
  placeholderText: string
  disclaimer: string
  variant: SubscribeVariant
};

const meta: Meta<SubscribeArgs> = {
  title: "Sections/Subscribe",
  argTypes: {
    variant: {
      control: "select",
      options: ["card", "inline", "banner"],
    },
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
    variant: "inline",
  },
  render: (args) => {
    return (
      <Subscribe
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        emailInput={(
          <input
            type="email"
            placeholder={args.placeholderText}
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", width: "100%", maxWidth: "300px" }}
          />
        )}
        button={(
          <button
            type="submit"
            style={{ padding: "0.75rem 1.5rem", background: "#6366f1", color: "white", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}
          >
            {args.buttonText}
          </button>
        )}
        disclaimer={args.disclaimer ? <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{args.disclaimer}</p> : undefined}
        variant={args.variant}
      />
    );
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
  args: { variant: "card" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /stay updated/i })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /subscribe/i })).toBeVisible();
  },
};

export const Banner: Story = {
  args: { variant: "banner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /stay updated/i })).toBeVisible();
  },
};
