import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "@muse/editor";
import type { ImageBlock } from "@muse/core";

type ImageArgs = {
  caption: string
  size: "small" | "medium" | "large" | "full"
};

const meta: Meta<ImageArgs> = {
  title: "Sections/Image",
  argTypes: {
    caption: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["small", "medium", "large", "full"],
    },
  },
  args: {
    caption: "A beautiful mountain landscape",
    size: "large",
  },
  render: (args) => {
    const block: ImageBlock = {
      id: "story-image",
      type: "image",
      version: 1,
      image: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        alt: "Mountain landscape",
      },
      caption: args.caption || undefined,
      size: args.size,
    };
    return <Image block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<ImageArgs>;

export const Small: Story = {
  args: { size: "small" },
};

export const Medium: Story = {
  args: { size: "medium" },
};

export const Large: Story = {
  args: { size: "large" },
};

export const Full: Story = {
  args: { size: "full" },
};
