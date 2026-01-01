import type { LogosSection } from "@muse/core";
import { Grid } from "./Grid";
import { Marquee } from "./Marquee";

export interface LogosProps {
  section: LogosSection
  onUpdate: (data: Partial<LogosSection>) => void
  isPending?: boolean
}

export function Logos(props: LogosProps) {
  const preset = props.section.preset ?? "logos-grid";

  switch (preset) {
    case "logos-marquee":
      return <Marquee {...props} />;
    case "logos-grid":
    default:
      return <Grid {...props} />;
  }
}
