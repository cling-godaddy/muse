import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Footer } from "@muse/editor";
import type { FooterSection, FooterLink, SocialLink } from "@muse/core";

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

type FooterArgs = {
  companyName: string
  copyright: string
  preset: string
  showLinks: boolean
  showSocials: boolean
};

const meta: Meta<FooterArgs> = {
  title: "Sections/Footer",
  argTypes: {
    companyName: { control: "text" },
    copyright: { control: "text" },
    preset: {
      control: "select",
      options: ["footer-simple"],
    },
    showLinks: { control: "boolean" },
    showSocials: { control: "boolean" },
  },
  args: {
    companyName: "Acme Inc",
    copyright: "2024 Acme Inc. All rights reserved.",
    preset: "footer-simple",
    showLinks: true,
    showSocials: true,
  },
  render: (args) => {
    const section: FooterSection = {
      id: "story-footer",
      type: "footer",
      version: 1,
      companyName: args.companyName || undefined,
      copyright: args.copyright || undefined,
      preset: args.preset,
      links: args.showLinks ? sampleLinks : undefined,
      socialLinks: args.showSocials ? sampleSocials : undefined,
    };
    return <Footer section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<FooterArgs>;

export const Simple: Story = {};
