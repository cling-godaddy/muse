import type { TestimonialsBlock as TestimonialsBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Single, Grid } from "./testimonials";

interface Props {
  block: TestimonialsBlockType
  onUpdate: (data: Partial<TestimonialsBlockType>) => void
}

export function TestimonialsBlock({ block, onUpdate }: Props) {
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
