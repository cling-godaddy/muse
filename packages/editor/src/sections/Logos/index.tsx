import type { LogosBlock } from "@muse/core";
import { Grid } from "./Grid";
import { Marquee } from "./Marquee";

export interface LogosProps {
  block: LogosBlock
  onUpdate: (data: Partial<LogosBlock>) => void
  isPending?: boolean
}

export function Logos(props: LogosProps) {
  const preset = props.block.preset ?? "logos-grid";

  switch (preset) {
    case "logos-marquee":
      return <Marquee {...props} />;
    case "logos-grid":
    default:
      return <Grid {...props} />;
  }
}
