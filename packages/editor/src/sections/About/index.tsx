import type { AboutSection as AboutSectionType, Usage } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Story } from "./Story";
import { Team } from "./Team";

interface Props {
  section: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

export function About({ section, onUpdate, isPending, trackUsage }: Props) {
  const preset = section.preset ?? getDefaultPreset("about");

  switch (preset) {
    case "about-team":
      return <Team section={section} onUpdate={onUpdate} isPending={isPending} />;
    case "about-story":
    default:
      return <Story section={section} onUpdate={onUpdate} isPending={isPending} trackUsage={trackUsage} />;
  }
}
