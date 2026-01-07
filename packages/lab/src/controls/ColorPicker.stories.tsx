import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPicker } from "@muse/editor";

const meta: Meta<typeof ColorPicker> = {
  title: "Controls/ColorPicker",
  component: ColorPicker,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: "color" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

function ColorPickerDemo(props: React.ComponentProps<typeof ColorPicker>) {
  const [color, setColor] = useState(props.value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ColorPicker {...props} value={color} onChange={setColor} />
      <div style={{ fontSize: 14, color: "#6b7280" }}>
        Selected:
        {" "}
        <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{color}</code>
      </div>
      <div
        style={{
          width: 200,
          height: 100,
          backgroundColor: color,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    value: "#6366f1",
  },
  render: args => <ColorPickerDemo {...args} />,
};

export const Disabled: Story = {
  args: {
    value: "#22c55e",
    disabled: true,
  },
  render: args => <ColorPickerDemo {...args} />,
};
