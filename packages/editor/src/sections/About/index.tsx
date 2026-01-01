import type { AboutBlock as AboutBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Story } from "./Story";
import { Team } from "./Team";

interface Props {
  block: AboutBlockType
  onUpdate: (data: Partial<AboutBlockType>) => void
  isPending?: boolean
}

export function About({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? getDefaultPreset("about");

  switch (preset) {
    case "about-team":
      return <Team block={block} onUpdate={onUpdate} isPending={isPending} />;
    case "about-story":
    default:
      return <Story block={block} onUpdate={onUpdate} isPending={isPending} />;
  }
}
