import type { GallerySection as GallerySectionType, Usage } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Masonry } from "./Masonry";
import { Carousel } from "./Carousel";

interface Props {
  section: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

export function Gallery({ section, onUpdate, isPending, trackUsage }: Props) {
  const preset = section.preset ?? getDefaultPreset("gallery");

  switch (preset) {
    case "gallery-masonry":
      return <Masonry section={section} onUpdate={onUpdate} isPending={isPending} trackUsage={trackUsage} />;
    case "gallery-carousel":
      return <Carousel section={section} onUpdate={onUpdate} isPending={isPending} trackUsage={trackUsage} />;
    case "gallery-grid":
    default:
      return <Grid section={section} onUpdate={onUpdate} isPending={isPending} trackUsage={trackUsage} />;
  }
}
