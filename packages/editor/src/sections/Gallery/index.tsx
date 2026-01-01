import type { GallerySection as GallerySectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Masonry } from "./Masonry";
import { Carousel } from "./Carousel";

interface Props {
  section: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
}

export function Gallery({ section, onUpdate }: Props) {
  const preset = section.preset ?? getDefaultPreset("gallery");

  switch (preset) {
    case "gallery-masonry":
      return <Masonry section={section} onUpdate={onUpdate} />;
    case "gallery-carousel":
      return <Carousel section={section} onUpdate={onUpdate} />;
    case "gallery-grid":
    default:
      return <Grid section={section} onUpdate={onUpdate} />;
  }
}
