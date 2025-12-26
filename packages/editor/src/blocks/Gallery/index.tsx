import type { GalleryBlock as GalleryBlockType } from "@muse/core";
import { getDefaultPreset } from "@muse/core";
import { Grid } from "./Grid";
import { Masonry } from "./Masonry";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
}

export function Gallery({ block, onUpdate }: Props) {
  const preset = block.preset ?? getDefaultPreset("gallery");

  switch (preset) {
    case "gallery-masonry":
      return <Masonry block={block} onUpdate={onUpdate} />;
    case "gallery-grid":
    case "gallery-carousel":
    default:
      return <Grid block={block} onUpdate={onUpdate} />;
  }
}
