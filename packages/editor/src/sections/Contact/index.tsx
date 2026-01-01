import type { ContactSection as ContactSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Form } from "./Form";
import { SplitMap } from "./SplitMap";

interface Props {
  section: ContactSectionType
  onUpdate: (data: Partial<ContactSectionType>) => void
}

export function Contact({ section, onUpdate }: Props) {
  const preset = section.preset ?? getDefaultPreset("contact");

  switch (preset) {
    case "contact-split-map":
      return <SplitMap section={section} onUpdate={onUpdate} />;
    case "contact-form":
    default:
      return <Form section={section} onUpdate={onUpdate} />;
  }
}
