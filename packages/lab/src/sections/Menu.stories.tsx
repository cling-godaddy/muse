import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from "@muse/editor";
import type { MenuSection, MenuCategory, MenuItem } from "@muse/core";

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

type MenuArgs = {
  headline: string
  subheadline: string
  preset: string
};

const meta: Meta<MenuArgs> = {
  title: "Sections/Menu",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    subheadline: { control: "text" },
  },
  args: {
    headline: "Our Menu",
    subheadline: "Fresh ingredients, crafted with care",
    preset: "menu-list",
  },
};

export default meta;
type Story = StoryObj<MenuArgs>;

export const List: Story = {
  render: (args) => {
    const section: MenuSection = {
      id: "story-menu",
      type: "menu",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      categories: sampleCategories,
    };
    return <Menu section={section} onUpdate={console.log} />;
  },
};

export const Cards: Story = {
  args: {
    headline: "Today's Selection",
    subheadline: "Freshly baked every morning",
    preset: "menu-cards",
  },
  render: (args) => {
    const section: MenuSection = {
      id: "story-menu",
      type: "menu",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleItemsWithImages,
    };
    return <Menu section={section} onUpdate={console.log} />;
  },
};

export const Simple: Story = {
  args: {
    headline: "Drinks",
    subheadline: "",
    preset: "menu-simple",
  },
  render: (args) => {
    const section: MenuSection = {
      id: "story-menu",
      type: "menu",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleSimpleItems,
    };
    return <Menu section={section} onUpdate={console.log} />;
  },
};
