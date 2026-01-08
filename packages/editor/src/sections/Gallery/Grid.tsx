import type { GallerySection as GallerySectionType } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  section: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
}

export function Grid({ section, onUpdate, isPending }: Props) {
  const columns = section.columns ?? 3;
  const images = section.images ?? [];

  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          value={section.headline}
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
          ? Array.from({ length: getMinimumImages(section.preset ?? "gallery-grid") }).map((_, i) => (
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
