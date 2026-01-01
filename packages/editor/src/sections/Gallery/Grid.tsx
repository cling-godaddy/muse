import type { GallerySection as GallerySectionType } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  block: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
}

export function Grid({ block, onUpdate, isPending }: Props) {
  const columns = block.columns ?? 3;
  const images = block.images ?? [];

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <EditableText
          value={block.headline}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {isPending && images.length === 0
          ? Array.from({ length: getMinimumImages(block.preset ?? "gallery-grid") }).map((_, i) => (
            <div key={i} className={styles.item}>
              <ImageLoader isPending />
            </div>
          ))
          : images.map((image, i) => (
            <div key={i} className={styles.item}>
              <ImageLoader image={image} isPending={false} />
            </div>
          ))}
      </div>
    </div>
  );
}
