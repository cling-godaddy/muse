import type { FeaturesSection as FeaturesSectionType, Site, Usage } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Bento } from "./Bento";
import { Numbered } from "./Numbered";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
  site?: Site
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
}

export function Features({ section, onUpdate, isPending, site, getToken, trackUsage }: Props) {
  const preset = section.preset ?? getDefaultPreset("features");

  switch (preset) {
    case "features-bento":
    case "features-bento-spotlight":
    case "features-bento-split":
      return <Bento section={section} onUpdate={onUpdate} isPending={isPending} site={site} getToken={getToken} trackUsage={trackUsage} />;
    case "features-numbered":
      return <Numbered section={section} onUpdate={onUpdate} isPending={isPending} site={site} getToken={getToken} trackUsage={trackUsage} />;
    case "features-grid":
    case "features-grid-images":
    default:
      return <Grid section={section} onUpdate={onUpdate} isPending={isPending} site={site} getToken={getToken} trackUsage={trackUsage} />;
  }
}
