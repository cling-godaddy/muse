import type { ImageBlock as ImageBlockType } from "@muse/core";
import { Image as ImageControl } from "../controls/Image";
import styles from "./Image.module.css";

interface Props {
  block: ImageBlockType
  onUpdate: (data: Partial<ImageBlockType>) => void
}

export function Image({ block, onUpdate }: Props) {
  const size = block.size ?? "medium";

  return (
    <div className={`${styles.section} ${styles[size]}`}>
      <div className={styles.container}>
        <ImageControl
          image={block.image}
          onUpdate={image => onUpdate({ image })}
          onReplace={() => { /* TODO: open picker */ }}
          className={styles.img}
        />
        {block.image.provider && (
          <span className={styles.attribution}>
            via
            {" "}
            {block.image.provider}
          </span>
        )}
      </div>
      <input
        type="text"
        className={styles.caption}
        value={block.caption ?? ""}
        onChange={e => onUpdate({ caption: e.target.value || undefined })}
        placeholder="Add caption..."
      />
    </div>
  );
}
