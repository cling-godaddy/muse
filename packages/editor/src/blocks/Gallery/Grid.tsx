import type { GalleryBlock as GalleryBlockType } from "@muse/core";
import styles from "./Grid.module.css";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
}

export function Grid({ block, onUpdate }: Props) {
  const columns = block.columns ?? 3;

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <input
          type="text"
          className={styles.headline}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {block.images.map((image, i) => (
          <div key={i} className={styles.item}>
            <img src={image.url} alt={image.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}
