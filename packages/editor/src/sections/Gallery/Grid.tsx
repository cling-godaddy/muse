import type { GallerySection as GallerySectionType, ImageSource, RichContent, Usage } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { Image } from "../../controls/Image";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Grid.module.css";

interface Props {
  section: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

export function Grid({ section, onUpdate, isPending, trackUsage }: Props) {
  const columns = section.columns ?? 3;
  const images = section.images ?? [];

  const updateImage = (index: number, image: ImageSource) => {
    const updated = [...images];
    updated[index] = image;
    onUpdate({ images: updated });
  };

  const removeImage = (index: number) => {
    onUpdate({ images: images.filter((_, i) => i !== index) });
  };

  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          rich
          hideLists
          value={section.headline}
          onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
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
              <Image
                image={image}
                onUpdate={img => updateImage(i, img)}
                onRemove={() => removeImage(i)}
                onUsage={trackUsage}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
