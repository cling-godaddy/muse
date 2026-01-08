import type { GallerySection as GallerySectionType, ImageSource, RichContent, Usage } from "@muse/core";
import { Image } from "../../controls/Image";
import { EditableText } from "../../ux";
import styles from "./Masonry.module.css";

interface Props {
  section: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Masonry({ section, onUpdate, isPending, trackUsage }: Props) {
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
          elementType="headline"
          value={section.headline}
          onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      <div
        className={styles.masonry}
        style={{ columnCount: columns }}
      >
        {images.map((image, i) => (
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
