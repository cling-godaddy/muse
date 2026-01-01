import type { TestimonialsSection as TestimonialsSectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Single } from "./Single";
import { Grid } from "./Grid";
import { Carousel } from "./Carousel";

interface Props {
  section: TestimonialsSectionType
  onUpdate: (data: Partial<TestimonialsSectionType>) => void
  isPending?: boolean
}

export function Testimonials({ section, onUpdate, isPending }: Props) {
  const preset = section.preset ?? getDefaultPreset("testimonials");

  switch (preset) {
    case "testimonials-single":
      return <Single section={section} onUpdate={onUpdate} isPending={isPending} />;
    case "testimonials-carousel":
      return <Carousel section={section} onUpdate={onUpdate} isPending={isPending} />;
    case "testimonials-grid":
    default:
      return <Grid section={section} onUpdate={onUpdate} isPending={isPending} />;
  }
}
