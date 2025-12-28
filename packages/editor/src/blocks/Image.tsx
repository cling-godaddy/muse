import type { ImageBlock as ImageBlockType } from "@muse/core";
import { Image as ImageControl } from "../controls/Image";
import { ImageLoader } from "../ux";
import styles from "./Image.module.css";

interface Props {
  block: ImageBlockType
  onUpdate: (data: Partial<ImageBlockType>) => void
  isPending?: boolean
}

export function Image({ block, onUpdate, isPending }: Props) {
  const size = block.size ?? "medium";

  return (
    <div className={`${styles.section} ${styles[size]}`}>
      <div className={styles.container}>
        {isPending && !block.image
          ? <ImageLoader isPending aspectRatio="16/9" className={styles.img} />
          : (
            <>
              <ImageControl
                image={block.image}
                onUpdate={image => onUpdate({ image })}
                className={styles.img}
              />
              {block.image?.provider && (
                <span className={styles.attribution}>
                  via
                  {" "}
                  {block.image.provider}
                </span>
              )}
            </>
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
