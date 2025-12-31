import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@muse/editor";
import type { TextBlock } from "@muse/core";

type TextArgs = {
  content: string
};

const meta: Meta<TextArgs> = {
  title: "Blocks/Text",
  argTypes: {
    content: { control: "text" },
  },
  args: {
    content: "This is a simple text block. Use it for body copy, descriptions, or any freeform content that doesn't fit into a structured section.",
  },
  render: (args) => {
    const block: TextBlock = {
      id: "story-text",
      type: "text",
      version: 1,
      content: args.content,
    };
    return <Text block={block} onUpdate={console.log} />;
  },
};

export default meta;
type Story = StoryObj<TextArgs>;

export const Default: Story = {};
