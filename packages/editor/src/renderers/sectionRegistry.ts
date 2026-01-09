import type { ReactNode } from "react";
import type { FieldSchema } from "@muse/sections";
import {
  Hero,
  Cta,
  Footer,
  About,
  Logos,
  Faq,
  Features,
  Gallery,
  Testimonials,
  Stats,
  Subscribe,
  Contact,
  Pricing,
  Menu,
  Products,
  Navbar,
} from "@muse/sections";

/**
 * A layout component with its schema attached.
 *
 * Each section has unique required props (headline, items, etc.), but they all:
 * 1. Accept ReactNode values for slots
 * 2. Have a static `schema` property describing their fields
 * 3. Have an optional `displayName`
 *
 * We use a permissive props type because EditableSection dynamically builds
 * the correct props based on the schema at runtime.
 */
export interface LayoutComponent {
  (props: Record<string, ReactNode | string | number | boolean | undefined>): ReactNode
  schema: Record<string, FieldSchema>
  displayName?: string
}

/**
 * Helper to register a section component.
 * The cast through unknown is intentional - TypeScript can't verify at compile time
 * that we're passing the right props, but EditableSection ensures this at runtime
 * by building props from the schema.
 */
function asLayout<T extends { schema: Record<string, FieldSchema>, displayName?: string }>(
  component: T,
): LayoutComponent {
  return component as unknown as LayoutComponent;
}

/**
 * Registry mapping section type strings to pure layout components.
 * These components are slot-based and have no editing logic.
 */
const sectionComponents: Record<string, LayoutComponent> = {
  hero: asLayout(Hero),
  cta: asLayout(Cta),
  footer: asLayout(Footer),
  about: asLayout(About),
  logos: asLayout(Logos),
  faq: asLayout(Faq),
  features: asLayout(Features),
  gallery: asLayout(Gallery),
  testimonials: asLayout(Testimonials),
  stats: asLayout(Stats),
  subscribe: asLayout(Subscribe),
  contact: asLayout(Contact),
  pricing: asLayout(Pricing),
  menu: asLayout(Menu),
  products: asLayout(Products),
  navbar: asLayout(Navbar),
};

/**
 * Get the pure layout component for a section type
 */
export function getLayoutComponent(type: string): LayoutComponent | undefined {
  return sectionComponents[type];
}

/**
 * Check if a section type has a registered layout component
 */
export function hasLayoutComponent(type: string): boolean {
  return type in sectionComponents;
}

/**
 * Get all registered section types
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(sectionComponents);
}
