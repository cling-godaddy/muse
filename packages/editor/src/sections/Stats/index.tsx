import type { StatsSection as StatsSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Row } from "./Row";
import { Grid } from "./Grid";
import { Counters } from "./Counters";

interface Props {
  block: StatsSectionType
  onUpdate: (data: Partial<StatsSectionType>) => void
  isPending?: boolean
}

export function Stats({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? getDefaultPreset("stats");

  switch (preset) {
    case "stats-grid":
      return <Grid block={block} onUpdate={onUpdate} />;
    case "stats-counters":
      return <Counters block={block} onUpdate={onUpdate} />;
    case "stats-row":
    default:
      return <Row block={block} onUpdate={onUpdate} isPending={isPending} />;
  }
}
