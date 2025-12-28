import type { GalleryBlock as GalleryBlockType, ImageSource } from "@muse/core";
import { useAutoResize } from "../../hooks";
import { Image } from "../../controls/Image";
import styles from "./Masonry.module.css";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
}

export function Masonry({ block, onUpdate }: Props) {
  const columns = block.columns ?? 3;
  const headlineRef = useAutoResize(block.headline ?? "");

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
