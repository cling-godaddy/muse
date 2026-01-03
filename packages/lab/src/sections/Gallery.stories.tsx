import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Gallery } from "@muse/editor";
import type { GallerySection, ImageSource } from "@muse/core";

const sampleImages: ImageSource[] = [
  { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", alt: "Mountain landscape" },
  { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600", alt: "Forest path" },
  { url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600", alt: "Lake reflection" },
  { url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600", alt: "Green hills" },
  { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600", alt: "Coastal cliffs" },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600", alt: "Misty mountains" },
  { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600", alt: "Snowy peaks" },
  { url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600", alt: "Waterfall" },
  { url: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=600", alt: "Autumn forest" },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600", alt: "Sunlit forest" },
];

type GalleryArgs = {
  headline: string
  columns: 2 | 3 | 4
  preset: string
  imageCount: number
};

const meta: Meta<GalleryArgs> = {
  title: "Sections/Gallery",
  argTypes: {
    preset: { table: { disable: true } },
    headline: {
      control: "text",
      description: "Section headline",
    },
    columns: {
      control: "inline-radio",
      options: [2, 3, 4],
      description: "Number of columns",
    },
    imageCount: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Number of images",
    },
  },
  args: {
    headline: "Our Work",
    columns: 3,
    preset: "gallery-grid",
    imageCount: 6,
  },
  render: (args) => {
    const section: GallerySection = {
      id: "story-gallery",
      type: "gallery",
      version: 1,
      headline: args.headline || undefined,
      columns: args.columns,
      preset: args.preset,
      images: sampleImages.slice(0, args.imageCount),
    };
    return <Gallery section={section} onUpdate={data => console.log("Update:", data)} />;
  },
};

export default meta;
type Story = StoryObj<GalleryArgs>;

export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /our work/i })).toBeVisible();
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};

export const Masonry: Story = {
  args: { preset: "gallery-masonry", imageCount: 9 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};

export const Carousel: Story = {
  args: { preset: "gallery-carousel", imageCount: 5 },
  argTypes: {
    preset: { table: { disable: true } },
    columns: { table: { disable: true } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};
