import type { FeaturesSection as FeaturesSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Bento } from "./Bento";
import { Numbered } from "./Numbered";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
}

export function Features({ section, onUpdate, isPending }: Props) {
  const preset = section.preset ?? getDefaultPreset("features");

  switch (preset) {
    case "features-bento":
    case "features-bento-spotlight":
    case "features-bento-split":
    case "features-bento-alt":
      return <Bento section={section} onUpdate={onUpdate} isPending={isPending} />;
    case "features-numbered":
      return <Numbered section={section} onUpdate={onUpdate} />;
    case "features-grid":
    case "features-grid-images":
    default:
      return <Grid section={section} onUpdate={onUpdate} isPending={isPending} />;
  }
}
