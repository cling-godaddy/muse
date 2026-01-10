import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Features, type FeaturesVariant } from "@muse/sections";
import type { FeatureItem } from "@muse/core";

const sampleItems: FeatureItem[] = [
  { icon: "zap", title: "Lightning Fast", description: "Built for speed with optimized performance." },
  { icon: "shield", title: "Secure", description: "Enterprise-grade security for your data." },
  { icon: "code", title: "Developer Friendly", description: "Clean APIs and great documentation." },
  { icon: "globe", title: "Global Scale", description: "Deploy anywhere in the world." },
  { icon: "heart", title: "User Focused", description: "Designed with users in mind." },
  { icon: "settings", title: "Customizable", description: "Tailor everything to your needs." },
  { icon: "layers", title: "Modular", description: "Mix and match components as needed." },
  { icon: "clock", title: "Always On", description: "99.9% uptime guarantee." },
  { icon: "users", title: "Team Ready", description: "Built for collaboration at scale." },
];

const sampleItemsWithImages: FeatureItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", alt: "Analytics dashboard" }, title: "Real-time Analytics", description: "Track performance metrics as they happen." },
  { image: { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600", alt: "Team collaboration" }, title: "Team Collaboration", description: "Work together seamlessly across time zones." },
  { image: { url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600", alt: "Cloud infrastructure" }, title: "Cloud Native", description: "Built for modern cloud infrastructure." },
  { image: { url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600", alt: "Code editor" }, title: "Developer Tools", description: "Powerful APIs and SDKs for every platform." },
  { image: { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600", alt: "Security" }, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption." },
  { image: { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", alt: "Data visualization" }, title: "Smart Insights", description: "AI-powered recommendations and forecasting." },
  { image: { url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600", alt: "Dashboard" }, title: "Custom Dashboards", description: "Build personalized views of your data." },
  { image: { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", alt: "Server room" }, title: "Global Infrastructure", description: "Deploy to any region with one click." },
  { image: { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600", alt: "Mobile app" }, title: "Mobile Ready", description: "Native apps for iOS and Android." },
];

/** Renders feature content - section provides item wrapper */
function FeatureContent({ item }: { item: FeatureItem }) {
  return (
    <>
      {item.icon && <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚡</div>}
      {item.image && <img src={item.image.url} alt={item.image.alt} style={{ width: "100%", borderRadius: "var(--muse-theme-radius)", marginBottom: "0.75rem" }} />}
      <h3 style={{ fontFamily: "var(--muse-theme-heading-font)", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muse-theme-text)" }}>{item.title}</h3>
      {item.description && <p style={{ fontFamily: "var(--muse-theme-body-font)", color: "var(--muse-theme-text-muted)", fontSize: "0.875rem" }}>{item.description}</p>}
    </>
  );
}

type FeaturesArgs = {
  headline: string
  variant: FeaturesVariant
  itemCount: number
  useImages: boolean
};

const meta: Meta<FeaturesArgs> = {
  title: "Sections/Features",
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "grid-images", "bento", "bento-spotlight", "bento-split", "numbered"],
    },
    headline: { control: "text" },
    itemCount: {
      control: { type: "range", min: 2, max: 9, step: 1 },
    },
    useImages: { control: "boolean" },
  },
  args: {
    headline: "Why Choose Us",
    variant: "grid",
    itemCount: 6,
    useImages: false,
  },
  render: (args) => {
    const items = args.useImages
      ? sampleItemsWithImages.slice(0, args.itemCount)
      : sampleItems.slice(0, args.itemCount);
    return (
      <Features
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        items={items.map((item, i) => <FeatureContent key={i} item={item} />)}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<FeaturesArgs>;

export const Cards: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /why choose us/i })).toBeVisible();
    await expect(canvas.getByText(/lightning fast/i)).toBeVisible();
    await expect(canvas.getByText(/secure/i)).toBeVisible();
  },
};

export const CardsWithImages: Story = {
  args: {
    headline: "Everything You Need",
    variant: "grid-images",
    itemCount: 6,
    useImages: true,
  },
};

export const BentoHero: Story = {
  args: {
    headline: "Platform Highlights",
    variant: "bento",
    itemCount: 6,
    useImages: true,
  },
};

export const BentoSpotlight: Story = {
  args: {
    headline: "Core Features",
    variant: "bento-spotlight",
    itemCount: 6,
    useImages: true,
  },
};

export const BentoSplit: Story = {
  args: {
    headline: "Key Benefits",
    variant: "bento-split",
    itemCount: 4,
    useImages: true,
  },
  argTypes: {
    itemCount: { control: { type: "range", min: 2, max: 8, step: 1 } },
  },
};

export const Numbered: Story = {
  args: {
    headline: "How It Works",
    variant: "numbered",
    itemCount: 4,
  },
};
