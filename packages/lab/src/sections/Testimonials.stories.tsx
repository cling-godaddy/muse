import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Testimonials, type TestimonialsVariant } from "@muse/sections";
import type { Quote } from "@muse/core";

const sampleQuotes: Quote[] = [
  {
    text: "This product transformed how we work. Incredible results in just weeks.",
    author: "Sarah Chen",
    role: "CEO",
    company: "TechCorp",
    avatar: { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", alt: "Sarah Chen" },
  },
  {
    text: "The best investment we've made this year. Our team productivity doubled.",
    author: "Michael Torres",
    role: "CTO",
    company: "StartupXYZ",
    avatar: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", alt: "Michael Torres" },
  },
  {
    text: "Outstanding support and a product that just works. Highly recommended.",
    author: "Emily Watson",
    role: "Director",
    company: "Agency Co",
    avatar: { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", alt: "Emily Watson" },
  },
];

/** Renders quote content - section provides card wrapper */
function QuoteContent({ quote }: { quote: Quote }) {
  return (
    <>
      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        "
        {quote.text}
        "
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {quote.avatar && (
          <img
            src={quote.avatar.url}
            alt={quote.avatar.alt}
            style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <div>
          <div style={{ fontWeight: 600 }}>{quote.author}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {quote.role}
            {quote.company && `, ${quote.company}`}
          </div>
        </div>
      </div>
    </>
  );
}

type TestimonialsArgs = {
  headline: string
  variant: TestimonialsVariant
  quoteCount: number
};

const meta: Meta<TestimonialsArgs> = {
  title: "Sections/Testimonials",
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "single", "carousel"],
    },
    headline: { control: "text" },
    quoteCount: {
      control: { type: "range", min: 1, max: 3, step: 1 },
    },
  },
  args: {
    headline: "What Our Customers Say",
    variant: "grid",
    quoteCount: 3,
  },
  render: (args) => {
    const quotes = sampleQuotes.slice(0, args.quoteCount);
    return (
      <Testimonials
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        quotes={quotes.map((q, i) => <QuoteContent key={i} quote={q} />)}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<TestimonialsArgs>;

export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /what our customers say/i })).toBeVisible();
    await expect(canvas.getByText(/sarah chen/i)).toBeVisible();
    await expect(canvas.getByText(/transformed how we work/i)).toBeVisible();
  },
};

export const Carousel: Story = {
  args: { variant: "carousel" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /what our customers say/i })).toBeVisible();
  },
};

export const Single: Story = {
  args: { variant: "single", quoteCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/sarah chen/i)).toBeVisible();
  },
};
