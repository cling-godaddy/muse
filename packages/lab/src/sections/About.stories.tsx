import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { About } from "@muse/editor";
import type { AboutSection, TeamMember } from "@muse/core";

const sampleTeam: TeamMember[] = [
  {
    name: "Alex Johnson",
    role: "CEO & Founder",
    image: { url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300", alt: "Alex Johnson" },
    bio: "Visionary leader with 15 years of experience.",
  },
  {
    name: "Sarah Chen",
    role: "CTO",
    image: { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300", alt: "Sarah Chen" },
    bio: "Tech enthusiast and problem solver.",
  },
  {
    name: "Michael Torres",
    role: "Head of Design",
    image: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", alt: "Michael Torres" },
    bio: "Creative mind behind our products.",
  },
];

type AboutArgs = {
  headline: string
  body: string
  preset: string
  showImage: boolean
  teamCount: number
};

const meta: Meta<AboutArgs> = {
  title: "Sections/About",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    body: { control: "text" },
    showImage: { control: "boolean" },
    teamCount: {
      control: { type: "range", min: 0, max: 3, step: 1 },
    },
  },
  args: {
    headline: "Our Story",
    body: "We started with a simple mission: to make building beautiful websites accessible to everyone. Today, we serve thousands of customers worldwide.",
    preset: "about-story",
    showImage: true,
    teamCount: 0,
  },
  render: (args) => {
    const section: AboutSection = {
      id: "story-about",
      type: "about",
      version: 1,
      headline: args.headline || undefined,
      body: args.body || undefined,
      preset: args.preset,
      image: args.showImage
        ? { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800", alt: "Team" }
        : undefined,
      teamMembers: args.teamCount > 0 ? sampleTeam.slice(0, args.teamCount) : undefined,
    };
    return <About section={section} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<AboutArgs>;

export const Story: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /our story/i })).toBeVisible();
    await expect(canvas.getByText(/simple mission/i)).toBeVisible();
  },
};

export const Team: Story = {
  args: {
    headline: "Meet the Team",
    preset: "about-team",
    teamCount: 3,
    showImage: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /meet the team/i })).toBeVisible();
    await expect(canvas.getByText(/alex johnson/i)).toBeVisible();
    await expect(canvas.getByText(/sarah chen/i)).toBeVisible();
  },
};
