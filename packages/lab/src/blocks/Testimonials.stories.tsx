import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Testimonials } from "@muse/editor";
import type { TestimonialsBlock, Quote } from "@muse/core";

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

type TestimonialsArgs = {
  headline: string
  preset: string
  quoteCount: number
};

const meta: Meta<TestimonialsArgs> = {
  title: "Blocks/Testimonials",
  argTypes: {
    headline: { control: "text" },
    preset: {
      control: "select",
      options: ["testimonials-grid", "testimonials-carousel", "testimonials-single"],
    },
    quoteCount: {
      control: { type: "range", min: 1, max: 3, step: 1 },
    },
  },
  args: {
    headline: "What Our Customers Say",
    preset: "testimonials-grid",
    quoteCount: 3,
  },
  render: (args) => {
    const block: TestimonialsBlock = {
      id: "story-testimonials",
      type: "testimonials",
      version: 1,
      headline: args.headline || undefined,
      preset: args.preset,
      quotes: sampleQuotes.slice(0, args.quoteCount),
    };
    return <Testimonials block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<TestimonialsArgs>;

export const Grid: Story = {};

export const Carousel: Story = {
  args: { preset: "testimonials-carousel" },
};

export const Single: Story = {
  args: { preset: "testimonials-single", quoteCount: 1 },
};
