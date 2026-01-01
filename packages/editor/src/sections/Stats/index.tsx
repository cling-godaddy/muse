import type { StatsSection as StatsSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Row } from "./Row";
import { Grid } from "./Grid";
import { Counters } from "./Counters";

interface Props {
  section: StatsSectionType
  onUpdate: (data: Partial<StatsSectionType>) => void
  isPending?: boolean
}

export function Stats({ section, onUpdate, isPending }: Props) {
  const preset = section.preset ?? getDefaultPreset("stats");

  switch (preset) {
    case "stats-grid":
      return <Grid section={section} onUpdate={onUpdate} />;
    case "stats-counters":
      return <Counters section={section} onUpdate={onUpdate} />;
    case "stats-row":
    default:
      return <Row section={section} onUpdate={onUpdate} isPending={isPending} />;
  }
}
