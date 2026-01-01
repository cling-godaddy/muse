import type { GallerySection as GallerySectionType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Masonry } from "./Masonry";
import { Carousel } from "./Carousel";

interface Props {
  block: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
}

export function Gallery({ block, onUpdate }: Props) {
  const preset = block.preset ?? getDefaultPreset("gallery");

  switch (preset) {
    case "gallery-masonry":
      return <Masonry block={block} onUpdate={onUpdate} />;
    case "gallery-carousel":
      return <Carousel block={block} onUpdate={onUpdate} />;
    case "gallery-grid":
    default:
      return <Grid block={block} onUpdate={onUpdate} />;
  }
}
