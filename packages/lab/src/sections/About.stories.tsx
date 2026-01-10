import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { About, type AboutVariant } from "@muse/sections";
import type { TeamMember } from "@muse/core";

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

/** Renders team member cards */
function TeamCards({ members }: { members: TeamMember[] }) {
  return (
    <>
      {members.map((member, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          {member.image && (
            <img
              src={member.image.url}
              alt={member.image.alt}
              style={{ width: "8rem", height: "8rem", borderRadius: "50%", objectFit: "cover", marginBottom: "1rem" }}
            />
          )}
          <h3 style={{ fontFamily: "var(--muse-theme-heading-font)", fontWeight: 600, marginBottom: "0.25rem", color: "var(--muse-theme-text)" }}>{member.name}</h3>
          <p style={{ fontFamily: "var(--muse-theme-body-font)", color: "var(--muse-theme-text-muted)", fontSize: "0.875rem" }}>{member.role}</p>
          {member.bio && <p style={{ fontFamily: "var(--muse-theme-body-font)", fontSize: "0.875rem", marginTop: "0.5rem", color: "var(--muse-theme-text-muted)" }}>{member.bio}</p>}
        </div>
      ))}
    </>
  );
}

type AboutArgs = {
  headline: string
  body: string
  variant: AboutVariant
  showImage: boolean
  teamCount: number
};

const meta: Meta<AboutArgs> = {
  title: "Sections/About",
  argTypes: {
    variant: {
      control: "select",
      options: ["story", "team"],
    },
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
    variant: "story",
    showImage: true,
    teamCount: 0,
  },
  render: (args) => {
    return (
      <About
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        body={args.body ? <p>{args.body}</p> : undefined}
        image={args.showImage ? <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800" alt="Team" style={{ width: "100%", borderRadius: "0.5rem" }} /> : undefined}
        teamMembers={args.teamCount > 0 ? <TeamCards members={sampleTeam.slice(0, args.teamCount)} /> : undefined}
        variant={args.variant}
      />
    );
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
    variant: "team",
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
