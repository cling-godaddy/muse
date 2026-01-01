import type { SubscribeSection as SubscribeSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Inline } from "./Inline";
import { Card } from "./Card";
import { Banner } from "./Banner";

interface Props {
  section: SubscribeSectionType
  onUpdate: (data: Partial<SubscribeSectionType>) => void
  isPending?: boolean
}

export function Subscribe({ section, onUpdate, isPending }: Props) {
  const preset = section.preset ?? getDefaultPreset("subscribe");

  switch (preset) {
    case "subscribe-inline":
      return <Inline section={section} onUpdate={onUpdate} />;
    case "subscribe-banner":
      return <Banner section={section} onUpdate={onUpdate} />;
    case "subscribe-card":
    default:
      return <Card section={section} onUpdate={onUpdate} isPending={isPending} />;
  }
}
