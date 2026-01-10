import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Navbar } from "@muse/sections";
import type { NavItem } from "@muse/core";

const sampleItems: NavItem[] = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

/** Renders nav items as links */
function NavItems({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          style={{
            fontFamily: "var(--muse-theme-body-font)",
            color: "var(--muse-theme-text)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

type NavbarArgs = {
  logoText: string
  showCta: boolean
  ctaText: string
  sticky: boolean
};

const meta: Meta<NavbarArgs> = {
  title: "Sections/Navbar",
  argTypes: {
    logoText: { control: "text" },
    showCta: { control: "boolean" },
    ctaText: { control: "text" },
    sticky: { control: "boolean" },
  },
  args: {
    logoText: "Acme",
    showCta: true,
    ctaText: "Get Started",
    sticky: false,
  },
  render: (args) => {
    return (
      <Navbar
        logo={
          args.logoText
            ? (
              <span style={{ fontWeight: 600, fontSize: "1.25rem" }}>
                {args.logoText}
              </span>
            )
            : undefined
        }
        items={<NavItems items={sampleItems} />}
        cta={
          args.showCta
            ? (
              <a
                href="#"
                style={{
                  backgroundColor: "var(--muse-theme-primary)",
                  color: "var(--muse-theme-on-primary)",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {args.ctaText}
              </a>
            )
            : undefined
        }
        sticky={args.sticky}
      />
    );
  },
};

export default meta;
type Story = StoryObj<NavbarArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Acme")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /get started/i })).toBeVisible();
  },
};

export const WithoutCta: Story = {
  args: {
    showCta: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Acme")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /get started/i })).toBeNull();
  },
};

export const Sticky: Story = {
  args: {
    sticky: true,
  },
};
