import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Logos, type LogosVariant } from "@muse/sections";
import type { LogoItem } from "@muse/core";

function makeLogo(name: string, color: string): LogoItem {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="${color}"/><text x="60" y="25" text-anchor="middle" fill="white" font-family="system-ui" font-size="14" font-weight="600">${name}</text></svg>`;
  return { image: { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: name }, href: "#" };
}

const sampleLogos: LogoItem[] = [
  makeLogo("Acme", "#3b82f6"),
  makeLogo("Globex", "#8b5cf6"),
  makeLogo("Initech", "#06b6d4"),
  makeLogo("Hooli", "#f59e0b"),
  makeLogo("Stark", "#ef4444"),
  makeLogo("Wayne", "#1e293b"),
  makeLogo("Umbrella", "#10b981"),
  makeLogo("Cyberdyne", "#6366f1"),
];

/** Renders logo items */
function LogoImages({ logos }: { logos: LogoItem[] }) {
  return (
    <>
      {logos.map((logo, i) => (
        <a key={i} href={logo.href} style={{ display: "block" }}>
          <img src={logo.image.url} alt={logo.image.alt} style={{ height: "40px", width: "auto" }} />
        </a>
      ))}
    </>
  );
}

type LogosArgs = {
  headline: string
  variant: LogosVariant
  logoCount: number
};

const meta: Meta<LogosArgs> = {
  title: "Sections/Logos",
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "marquee"],
    },
    headline: { control: "text" },
    logoCount: {
      control: { type: "range", min: 3, max: 8, step: 1 },
    },
  },
  args: {
    headline: "Trusted By",
    variant: "grid",
    logoCount: 6,
  },
  render: (args) => {
    const logos = sampleLogos.slice(0, args.logoCount);
    return (
      <Logos
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        logos={<LogoImages logos={logos} />}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<LogosArgs>;

export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /trusted by/i })).toBeVisible();
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};

export const Marquee: Story = {
  args: { variant: "marquee", logoCount: 8 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};
