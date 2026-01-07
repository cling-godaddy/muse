import type { LayoutPattern } from "@muse/core";
import * as Wireframes from "./wireframes";
import styles from "./LayoutPreview.module.css";

interface LayoutPreviewProps {
  layoutPattern: LayoutPattern
}

export function LayoutPreview({ layoutPattern }: LayoutPreviewProps) {
  const wireframeMap: Record<LayoutPattern, React.ComponentType<{ className?: string }>> = {
    centered: Wireframes.CenteredWireframe,
    split: Wireframes.SplitWireframe,
    grid: Wireframes.GridWireframe,
    cards: Wireframes.CardsWireframe,
    carousel: Wireframes.CarouselWireframe,
    masonry: Wireframes.MasonryWireframe,
    alternating: Wireframes.AlternatingWireframe,
    accordion: Wireframes.AccordionWireframe,
    banner: Wireframes.BannerWireframe,
    overlay: Wireframes.OverlayWireframe,
    list: Wireframes.ListWireframe,
    table: Wireframes.TableWireframe,
  };

  const WireframeComponent = wireframeMap[layoutPattern];

  if (!WireframeComponent) {
    console.warn(`No wireframe found for layout pattern: ${layoutPattern}`);
    return null;
  }

  return (
    <figure className={styles.preview} aria-label={`${layoutPattern} layout`}>
      <WireframeComponent className={styles.wireframe} />
    </figure>
  );
}
