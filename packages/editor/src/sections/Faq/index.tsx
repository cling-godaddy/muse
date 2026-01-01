import type { FaqSection as FaqSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Accordion } from "./Accordion";
import { TwoColumn } from "./TwoColumn";

interface Props {
  block: FaqSectionType
  onUpdate: (data: Partial<FaqSectionType>) => void
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
