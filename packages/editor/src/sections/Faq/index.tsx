import type { FaqBlock as FaqBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Accordion } from "./Accordion";
import { TwoColumn } from "./TwoColumn";

interface Props {
  block: FaqBlockType
  onUpdate: (data: Partial<FaqBlockType>) => void
}

export function Faq({ block, onUpdate }: Props) {
  const preset = block.preset ?? getDefaultPreset("faq");

  switch (preset) {
    case "faq-two-column":
      return <TwoColumn block={block} onUpdate={onUpdate} />;
    case "faq-accordion":
    default:
      return <Accordion block={block} onUpdate={onUpdate} />;
  }
}
