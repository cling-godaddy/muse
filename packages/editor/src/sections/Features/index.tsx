import type { FeaturesSection as FeaturesSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Numbered } from "./Numbered";

interface Props {
  block: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
}

export function Features({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? getDefaultPreset("features");

  switch (preset) {
    case "features-numbered":
      return <Numbered block={block} onUpdate={onUpdate} />;
    case "features-grid":
    default:
      return <Grid block={block} onUpdate={onUpdate} isPending={isPending} />;
  }
}
