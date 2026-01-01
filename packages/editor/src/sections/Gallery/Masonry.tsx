import type { GallerySection as GallerySectionType, ImageSource } from "@muse/core";
import { Image } from "../../controls/Image";
import { EditableText } from "../../ux";
import styles from "./Masonry.module.css";

interface Props {
  block: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
}

export function Masonry({ block, onUpdate }: Props) {
  const columns = block.columns ?? 3;
  const images = block.images ?? [];

  const updateImage = (index: number, image: ImageSource) => {
    const updated = [...images];
    updated[index] = image;
    onUpdate({ images: updated });
  };

  const removeImage = (index: number) => {
    onUpdate({ images: images.filter((_, i) => i !== index) });
  };

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
        className={styles.masonry}
        style={{ columnCount: columns }}
      >
        {images.map((image, i) => (
          <div key={i} className={styles.item}>
            <Image
              image={image}
              onUpdate={img => updateImage(i, img)}
              onRemove={() => removeImage(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
