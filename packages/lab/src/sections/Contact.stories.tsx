import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Contact, type ContactVariant } from "@muse/sections";
import type { FormField } from "@muse/core";

const sampleFields: FormField[] = [
  { name: "name", type: "text", label: "Name", placeholder: "Your name", required: true },
  { name: "email", type: "email", label: "Email", placeholder: "you@example.com", required: true },
  { name: "message", type: "textarea", label: "Message", placeholder: "How can we help?", required: true },
];

/** Renders a simple form from field definitions */
function ContactForm({ fields, submitText }: { fields: FormField[], submitText: string }) {
  return (
    <form style={{ display: "flex", flexDirection: "column", gap: "1rem", fontFamily: "var(--muse-theme-body-font)" }}>
      {fields.map(field => (
        <div key={field.name}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem", color: "var(--muse-theme-text)" }}>
            {field.label}
            {field.required && <span style={{ color: "#ef4444" }}> *</span>}
          </label>
          {field.type === "textarea"
            ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--muse-theme-text-muted)", borderRadius: "var(--muse-theme-radius)", minHeight: "6rem", fontFamily: "inherit" }}
              />
            )
            : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--muse-theme-text-muted)", borderRadius: "var(--muse-theme-radius)", fontFamily: "inherit" }}
              />
            )}
        </div>
      ))}
      <button
        type="submit"
        style={{ padding: "0.75rem 1.5rem", background: "var(--muse-theme-cta-bg)", color: "var(--muse-theme-cta-text)", borderRadius: "var(--muse-theme-radius)", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        {submitText}
      </button>
    </form>
  );
}

/** Renders contact info */
function ContactInfo({ email, phone, address }: { email?: string, phone?: string, address?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "var(--muse-theme-body-font)", color: "var(--muse-theme-text)" }}>
      {email && (
        <p>
          Email:
          {email}
        </p>
      )}
      {phone && (
        <p>
          Phone:
          {phone}
        </p>
      )}
      {address && (
        <p>
          Address:
          {address}
        </p>
      )}
    </div>
  );
}

type ContactArgs = {
  headline: string
  subheadline: string
  email: string
  phone: string
  address: string
  variant: ContactVariant
  showForm: boolean
};

const meta: Meta<ContactArgs> = {
  title: "Sections/Contact",
  argTypes: {
    variant: {
      control: "select",
      options: ["form", "split-map"],
    },
    headline: { control: "text" },
    subheadline: { control: "text" },
    email: { control: "text" },
    phone: { control: "text" },
    address: { control: "text" },
    showForm: { control: "boolean" },
  },
  args: {
    headline: "Get in Touch",
    subheadline: "We'd love to hear from you",
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    address: "",
    variant: "form",
    showForm: true,
  },
  render: (args) => {
    return (
      <Contact
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        contactInfo={<ContactInfo email={args.email} phone={args.phone} address={args.address} />}
        form={args.showForm ? <ContactForm fields={sampleFields} submitText="Send Message" /> : undefined}
        map={args.variant === "split-map" && args.address
          ? (
            <div style={{ background: "var(--muse-theme-bg-alt)", height: "100%", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--muse-theme-radius)" }}>
              <span style={{ color: "var(--muse-theme-text-muted)", fontFamily: "var(--muse-theme-body-font)" }}>Map placeholder</span>
            </div>
          )
          : undefined}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<ContactArgs>;

export const Form: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /get in touch/i })).toBeVisible();
    await expect(canvas.getByPlaceholderText(/name/i)).toBeVisible();
    await expect(canvas.getByRole("button", { name: /send message/i })).toBeVisible();
  },
};

export const SplitMap: Story = {
  args: {
    variant: "split-map",
    address: "1600 Amphitheatre Parkway, Mountain View, CA",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /get in touch/i })).toBeVisible();
    await expect(canvas.getByText(/1600 amphitheatre/i)).toBeVisible();
  },
};
