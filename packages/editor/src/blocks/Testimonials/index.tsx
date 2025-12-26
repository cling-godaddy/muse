import type { TestimonialsBlock as TestimonialsBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Single } from "./Single";
import { Grid } from "./Grid";

interface Props {
  block: TestimonialsBlockType
  onUpdate: (data: Partial<TestimonialsBlockType>) => void
}

export function Testimonials({ block, onUpdate }: Props) {
  const preset = block.preset ?? getDefaultPreset("testimonials");

  switch (preset) {
    case "testimonials-single":
      return <Single block={block} onUpdate={onUpdate} />;
    case "testimonials-grid":
    case "testimonials-carousel":
    default:
      return <Grid block={block} onUpdate={onUpdate} />;
  }
}
