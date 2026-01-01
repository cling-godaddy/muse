import type { TestimonialsSection as TestimonialsSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Single } from "./Single";
import { Grid } from "./Grid";
import { Carousel } from "./Carousel";

interface Props {
  block: TestimonialsSectionType
  onUpdate: (data: Partial<TestimonialsSectionType>) => void
  isPending?: boolean
}

export function Testimonials({ block, onUpdate, isPending }: Props) {
  const preset = block.preset ?? getDefaultPreset("testimonials");

  switch (preset) {
    case "testimonials-single":
      return <Single block={block} onUpdate={onUpdate} isPending={isPending} />;
    case "testimonials-carousel":
      return <Carousel block={block} onUpdate={onUpdate} isPending={isPending} />;
    case "testimonials-grid":
    default:
      return <Grid block={block} onUpdate={onUpdate} isPending={isPending} />;
  }
}
