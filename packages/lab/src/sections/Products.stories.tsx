import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Products } from "@muse/editor";
import type { ProductsSection, ProductItem } from "@muse/core";

const sampleProducts: ProductItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", alt: "Watch" }, name: "Classic Watch", price: "$249", rating: 4.8 },
  { image: { url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", alt: "Headphones" }, name: "Wireless Headphones", price: "$179", originalPrice: "$229", rating: 4.5, badge: "Sale" },
  { image: { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", alt: "Sunglasses" }, name: "Aviator Sunglasses", price: "$129", rating: 4.7 },
  { image: { url: "https://images.unsplash.com/photo-1491553895911-0055uj7e-20?w=400", alt: "Backpack" }, name: "Canvas Backpack", price: "$89", rating: 4.6 },
  { image: { url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400", alt: "Sneakers" }, name: "Running Sneakers", price: "$145", rating: 4.9, badge: "New" },
  { image: { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", alt: "Bag" }, name: "Leather Tote", price: "$195", rating: 4.4 },
  { image: { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", alt: "Camera" }, name: "Polaroid Camera", price: "$99", rating: 4.3 },
  { image: { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", alt: "Headphones 2" }, name: "Studio Headphones", price: "$299", rating: 4.8 },
  { image: { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", alt: "Sneaker" }, name: "Sport Sneaker", price: "$135", rating: 4.6 },
  { image: { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400", alt: "Watch 2" }, name: "Digital Watch", price: "$189", rating: 4.5, badge: "Popular" },
  { image: { url: "https://images.unsplash.com/photo-1434056886845-dbd39c1cc727?w=400", alt: "Wallet" }, name: "Leather Wallet", price: "$79", rating: 4.7 },
  { image: { url: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400", alt: "AirPods" }, name: "Wireless Earbuds", price: "$159", rating: 4.8 },
  { image: { url: "https://images.unsplash.com/photo-1587467512961-120760940315?w=400", alt: "Smart Watch" }, name: "Smart Watch", price: "$349", originalPrice: "$399", rating: 4.9, badge: "Sale" },
  { image: { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400", alt: "Sneakers 2" }, name: "Classic Sneakers", price: "$95", rating: 4.4 },
  { image: { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", alt: "Backpack 2" }, name: "Travel Backpack", price: "$129", rating: 4.6, badge: "New" },
  { image: { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400", alt: "Handbag" }, name: "Designer Handbag", price: "$275", rating: 4.7 },
];

const sampleMinimalProducts: ProductItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400", alt: "Vase" }, name: "Ceramic Vase", price: "$85" },
  { image: { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", alt: "Chair" }, name: "Accent Chair", price: "$450" },
  { image: { url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400", alt: "Lamp" }, name: "Table Lamp", price: "$120" },
  { image: { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", alt: "Sofa" }, name: "Velvet Sofa", price: "$1,299" },
  { image: { url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400", alt: "Coffee Table" }, name: "Oak Coffee Table", price: "$380" },
  { image: { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", alt: "Mirror" }, name: "Round Mirror", price: "$165" },
  { image: { url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400", alt: "Plant" }, name: "Fiddle Leaf Fig", price: "$95" },
  { image: { url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400", alt: "Clock" }, name: "Wall Clock", price: "$145" },
  { image: { url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400", alt: "Desk" }, name: "Writing Desk", price: "$680" },
  { image: { url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400", alt: "Bookshelf" }, name: "Floating Shelf", price: "$95" },
  { image: { url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", alt: "Rug" }, name: "Woven Rug", price: "$320" },
  { image: { url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400", alt: "Armchair" }, name: "Lounge Chair", price: "$890" },
  { image: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", alt: "Art" }, name: "Abstract Print", price: "$240" },
  { image: { url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400", alt: "Planter" }, name: "Concrete Planter", price: "$65" },
  { image: { url: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400", alt: "Throw" }, name: "Wool Throw", price: "$180" },
  { image: { url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400", alt: "Side Table" }, name: "Side Table", price: "$275" },
];

type ProductsArgs = {
  headline: string
  subheadline: string
  preset: string
  itemCount: number
};

const meta: Meta<ProductsArgs> = {
  title: "Sections/Products",
  argTypes: {
    preset: { table: { disable: true } },
    headline: { control: "text" },
    subheadline: { control: "text" },
    itemCount: { control: { type: "range", min: 2, max: 16, step: 1 } },
  },
  args: {
    headline: "Featured Products",
    subheadline: "Handpicked favorites from our collection",
    preset: "products-grid",
    itemCount: 8,
  },
};

export default meta;
type Story = StoryObj<ProductsArgs>;

export const Grid: Story = {
  render: (args) => {
    const section: ProductsSection = {
      id: "story-products",
      type: "products",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleProducts.slice(0, args.itemCount),
    };
    return <Products section={section} onUpdate={console.log} />;
  },
};

export const Featured: Story = {
  args: {
    headline: "Shop the Collection",
    subheadline: "Our best sellers this season",
    preset: "products-featured",
    itemCount: 5,
  },
  argTypes: {
    itemCount: { control: { type: "range", min: 3, max: 5, step: 1 } },
  },
  render: (args) => {
    const section: ProductsSection = {
      id: "story-products",
      type: "products",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleProducts.slice(0, args.itemCount),
    };
    return <Products section={section} onUpdate={console.log} />;
  },
};

export const Minimal: Story = {
  args: {
    headline: "New Arrivals",
    subheadline: "",
    preset: "products-minimal",
    itemCount: 8,
  },
  argTypes: {
    itemCount: { control: { type: "range", min: 2, max: 16, step: 1 } },
  },
  render: (args) => {
    const section: ProductsSection = {
      id: "story-products",
      type: "products",
      version: 1,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      preset: args.preset,
      items: sampleMinimalProducts.slice(0, args.itemCount),
    };
    return <Products section={section} onUpdate={console.log} />;
  },
};
