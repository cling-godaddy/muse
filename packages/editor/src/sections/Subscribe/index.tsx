import type { SubscribeSection as SubscribeSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Inline } from "./Inline";
import { Card } from "./Card";
import { Banner } from "./Banner";

interface Props {
  block: SubscribeSectionType
  onUpdate: (data: Partial<SubscribeSectionType>) => void
  isPending?: boolean
}

export function Subscribe({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? getDefaultPreset("subscribe");

  switch (preset) {
    case "subscribe-inline":
      return <Inline block={block} onUpdate={onUpdate} />;
    case "subscribe-banner":
      return <Banner block={block} onUpdate={onUpdate} />;
    case "subscribe-card":
    default:
      return <Card block={block} onUpdate={onUpdate} isPending={isPending} />;
  }
}
