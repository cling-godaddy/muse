import type { ContactBlock as ContactBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Form } from "./Form";
import { SplitMap } from "./SplitMap";

interface Props {
  block: ContactBlockType
  onUpdate: (data: Partial<ContactBlockType>) => void
}

export function Contact({ block, onUpdate }: Props) {
  const preset = block.preset ?? getDefaultPreset("contact");

  switch (preset) {
    case "contact-split-map":
      return <SplitMap block={block} onUpdate={onUpdate} />;
    case "contact-form":
    default:
      return <Form block={block} onUpdate={onUpdate} />;
  }
}
