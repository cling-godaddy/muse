import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Contact } from "@muse/editor";
import type { ContactBlock, FormField } from "@muse/core";

const sampleFields: FormField[] = [
  { name: "name", type: "text", label: "Name", placeholder: "Your name", required: true },
  { name: "email", type: "email", label: "Email", placeholder: "you@example.com", required: true },
  { name: "message", type: "textarea", label: "Message", placeholder: "How can we help?", required: true },
];

type ContactArgs = {
  headline: string
  subheadline: string
  email: string
  phone: string
  address: string
  preset: string
  showForm: boolean
};

const meta: Meta<ContactArgs> = {
  title: "Sections/Contact",
  argTypes: {
    headline: { control: "text" },
    subheadline: { control: "text" },
    email: { control: "text" },
    phone: { control: "text" },
    address: { control: "text" },
    preset: {
      control: "select",
      options: ["contact-form", "contact-split-map"],
    },
    showForm: { control: "boolean" },
  },
  args: {
    headline: "Get in Touch",
    subheadline: "We'd love to hear from you",
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    address: "",
    preset: "contact-form",
    showForm: true,
  },
  render: (args) => {
    const block: ContactBlock = {
      id: "story-contact",
      type: "contact",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      email: args.email || undefined,
      phone: args.phone || undefined,
      address: args.address || undefined,
      preset: args.preset,
      formFields: args.showForm ? sampleFields : undefined,
      submitText: "Send Message",
    };
    return <Contact block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<ContactArgs>;

export const Form: Story = {};

export const SplitMap: Story = {
  args: {
    preset: "contact-split-map",
    address: "1600 Amphitheatre Parkway, Mountain View, CA",
  },
};
