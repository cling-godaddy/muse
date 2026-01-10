import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Footer } from "@muse/sections";
import type { FooterLink, SocialLink, SocialPlatform } from "@muse/core";
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Github } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sampleLinks: FooterLink[] = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

const sampleSocials: SocialLink[] = [
  { platform: "twitter", href: "#" },
  { platform: "github", href: "#" },
  { platform: "linkedin", href: "#" },
];

/** Renders footer links */
function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <>
      {links.map((link, i) => (
        <a key={i} href={link.href} style={{ fontFamily: "var(--muse-theme-body-font)", color: "var(--muse-theme-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
          {link.label}
        </a>
      ))}
    </>
  );
}

const socialIcons: Record<SocialPlatform, LucideIcon> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  tiktok: Twitter,
};

/** Renders social icons */
function SocialIcons({ socials }: { socials: SocialLink[] }) {
  return (
    <>
      {socials.map((social, i) => {
        const Icon = socialIcons[social.platform];
        return (
          <a key={i} href={social.href} style={{ color: "var(--muse-theme-text-muted)" }} aria-label={social.platform}>
            <Icon size={20} />
          </a>
        );
      })}
    </>
  );
}

type FooterArgs = {
  companyName: string
  copyright: string
  showLinks: boolean
  showSocials: boolean
};

const meta: Meta<FooterArgs> = {
  title: "Sections/Footer",
  argTypes: {
    companyName: { control: "text" },
    copyright: { control: "text" },
    showLinks: { control: "boolean" },
    showSocials: { control: "boolean" },
  },
  args: {
    companyName: "Acme Inc",
    copyright: "2024 Acme Inc. All rights reserved.",
    showLinks: true,
    showSocials: true,
  },
  render: (args) => {
    return (
      <Footer
        companyName={args.companyName ? <span>{args.companyName}</span> : undefined}
        links={args.showLinks ? <FooterLinks links={sampleLinks} /> : undefined}
        socialLinks={args.showSocials ? <SocialIcons socials={sampleSocials} /> : undefined}
        copyright={args.copyright ? <p>{args.copyright}</p> : undefined}
      />
    );
  },
};

export default meta;
type Story = StoryObj<FooterArgs>;

export const Simple: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /about/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /privacy/i })).toBeVisible();
  },
};
