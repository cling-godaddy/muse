import type { GalleryBlock as GalleryBlockType } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { useAutoResize } from "../../hooks";
import { ImageLoader } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
  isPending?: boolean
}

export function Grid({ block, onUpdate, isPending }: Props) {
  const columns = block.columns ?? 3;
  const headlineRef = useAutoResize(block.headline ?? "");
  const images = block.images ?? [];

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <textarea
          ref={headlineRef}
          className={styles.headline}
          rows={1}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
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
