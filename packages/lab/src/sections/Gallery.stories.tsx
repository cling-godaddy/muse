import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Gallery, type GalleryVariant } from "@muse/sections";
import type { ImageSource } from "@muse/core";

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

/** Renders gallery images */
function GalleryImages({ images }: { images: ImageSource[] }) {
  return (
    <>
      {images.map((image, i) => (
        <img key={i} src={image.url} alt={image.alt} style={{ width: "100%", height: "auto", borderRadius: "0.5rem" }} />
      ))}
    </>
  );
}

type GalleryArgs = {
  headline: string
  columns: 2 | 3 | 4
  variant: GalleryVariant
  imageCount: number
};

const meta: Meta<GalleryArgs> = {
  title: "Sections/Gallery",
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "masonry", "carousel"],
    },
    headline: { control: "text" },
    columns: {
      control: "inline-radio",
      options: [2, 3, 4],
    },
    imageCount: {
      control: { type: "range", min: 1, max: 10, step: 1 },
    },
  },
  args: {
    headline: "Our Work",
    columns: 3,
    variant: "grid",
    imageCount: 6,
  },
  render: (args) => {
    const images = sampleImages.slice(0, args.imageCount);
    return (
      <Gallery
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        images={<GalleryImages images={images} />}
        variant={args.variant}
        columns={args.columns}
      />
    );
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
  args: { variant: "masonry", imageCount: 9 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};

export const Carousel: Story = {
  args: { variant: "carousel", imageCount: 5 },
  argTypes: {
    columns: { table: { disable: true } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img").length).toBeGreaterThanOrEqual(1);
  },
};
