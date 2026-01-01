import type { FaqSection as FaqSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Accordion } from "./Accordion";
import { TwoColumn } from "./TwoColumn";

interface Props {
  section: FaqSectionType
  onUpdate: (data: Partial<FaqSectionType>) => void
}

export function Faq({ section, onUpdate }: Props) {
  const preset = section.preset ?? getDefaultPreset("faq");

  switch (preset) {
    case "faq-two-column":
      return <TwoColumn section={section} onUpdate={onUpdate} />;
    case "faq-accordion":
    default:
      return <Accordion section={section} onUpdate={onUpdate} />;
  }
}
