import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Menu, type MenuVariant } from "@muse/sections";
import type { MenuCategory, MenuItem } from "@muse/core";

const sampleCategories: MenuCategory[] = [
  {
    name: "Starters",
    items: [
      { name: "Soup of the Day", description: "Chef's daily creation with fresh herbs", price: "$8", tags: ["vegan"] },
      { name: "Bruschetta", description: "Grilled bread with tomatoes, basil, garlic", price: "$12" },
      { name: "Calamari", description: "Crispy fried squid with marinara sauce", price: "$14" },
    ],
  },
  {
    name: "Mains",
    items: [
      { name: "Grilled Salmon", description: "Atlantic salmon with seasonal vegetables", price: "$28", tags: ["gf"] },
      { name: "Pasta Primavera", description: "Fresh garden vegetables in light cream sauce", price: "$18", tags: ["vegan"] },
      { name: "Ribeye Steak", description: "12oz prime cut with garlic butter", price: "$42" },
      { name: "Chicken Parmesan", description: "Breaded chicken breast with marinara and mozzarella", price: "$24" },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Tiramisu", description: "Classic Italian espresso-soaked ladyfingers", price: "$10" },
      { name: "Sorbet Trio", description: "Seasonal fruit sorbets", price: "$8", tags: ["vegan", "gf"] },
      { name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla ice cream", price: "$12" },
    ],
  },
];

const sampleItemsWithImages: MenuItem[] = [
  { name: "Croissant", description: "Buttery, flaky French pastry", price: "$4.50", image: { url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", alt: "Croissant" } },
  { name: "Blueberry Muffin", description: "Fresh-baked with real blueberries", price: "$3.75", image: { url: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400", alt: "Muffin" }, tags: ["popular"] },
  { name: "Cinnamon Roll", description: "Warm with cream cheese frosting", price: "$5.00", image: { url: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400", alt: "Cinnamon roll" } },
  { name: "Avocado Toast", description: "Sourdough with smashed avocado and eggs", price: "$12.00", image: { url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400", alt: "Avocado toast" }, tags: ["vegan"] },
  { name: "Latte", description: "Double shot with steamed milk", price: "$5.50", image: { url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400", alt: "Latte" } },
  { name: "Matcha Latte", description: "Ceremonial grade with oat milk", price: "$6.00", image: { url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400", alt: "Matcha latte" }, tags: ["vegan"] },
];

const sampleSimpleItems: MenuItem[] = [
  { name: "House Red", price: "$12" },
  { name: "House White", price: "$12" },
  { name: "Prosecco", price: "$14" },
  { name: "Champagne", price: "$18" },
  { name: "IPA", price: "$8" },
  { name: "Lager", price: "$7" },
  { name: "Stout", price: "$9" },
  { name: "Cider", price: "$8" },
  { name: "Espresso", price: "$3" },
  { name: "Americano", price: "$4" },
  { name: "Cappuccino", price: "$5" },
  { name: "Latte", price: "$5" },
];

/** Renders menu categories */
function MenuCategories({ categories }: { categories: MenuCategory[] }) {
  return (
    <>
      {categories.map((category, i) => (
        <div key={i} style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>{category.name}</h3>
          {category.items.map((item, j) => (
            <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                {item.description && <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{item.description}</div>}
              </div>
              <div style={{ fontWeight: 600 }}>{item.price}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** Renders menu items as cards */
function MenuCards({ items }: { items: MenuItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#f9fafb", borderRadius: "0.5rem", overflow: "hidden" }}>
          {item.image && <img src={item.image.url} alt={item.image.alt} style={{ width: "100%", height: "150px", objectFit: "cover" }} />}
          <div style={{ padding: "1rem" }}>
            <div style={{ fontWeight: 500 }}>{item.name}</div>
            {item.description && <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>{item.description}</div>}
            <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>{item.price}</div>
          </div>
        </div>
      ))}
    </>
  );
}

/** Renders simple menu items */
function SimpleMenuItems({ items }: { items: MenuItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
          <span>{item.name}</span>
          <span style={{ fontWeight: 500 }}>{item.price}</span>
        </div>
      ))}
    </>
  );
}

type MenuArgs = {
  headline: string
  subheadline: string
  variant: MenuVariant
};

const meta: Meta<MenuArgs> = {
  title: "Sections/Menu",
  argTypes: {
    variant: {
      control: "select",
      options: ["list", "cards", "simple"],
    },
    headline: { control: "text" },
    subheadline: { control: "text" },
  },
  args: {
    headline: "Our Menu",
    subheadline: "Fresh ingredients, crafted with care",
    variant: "list",
  },
};

export default meta;
type Story = StoryObj<MenuArgs>;

export const List: Story = {
  render: (args) => {
    return (
      <Menu
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        items={<MenuCategories categories={sampleCategories} />}
        variant={args.variant}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /our menu/i })).toBeVisible();
    await expect(canvas.getByText(/starters/i)).toBeVisible();
    await expect(canvas.getByText(/soup of the day/i)).toBeVisible();
  },
};

export const Cards: Story = {
  args: {
    headline: "Today's Selection",
    subheadline: "Freshly baked every morning",
    variant: "cards",
  },
  render: (args) => {
    return (
      <Menu
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        items={<MenuCards items={sampleItemsWithImages} />}
        variant={args.variant}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /today's selection/i })).toBeVisible();
    await expect(canvas.getByText(/croissant/i)).toBeVisible();
  },
};

export const Simple: Story = {
  args: {
    headline: "Drinks",
    subheadline: "",
    variant: "simple",
  },
  render: (args) => {
    return (
      <Menu
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        items={<SimpleMenuItems items={sampleSimpleItems} />}
        variant={args.variant}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /drinks/i })).toBeVisible();
    await expect(canvas.getByText(/house red/i)).toBeVisible();
  },
};
