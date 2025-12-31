import type { ImageBlock as ImageBlockType } from "@muse/core";
import { Image as ImageControl } from "../controls/Image";
import { EditableText, ImageLoader } from "../ux";
import { useIsEditable } from "../context/EditorModeContext";
import styles from "./Image.module.css";

interface Props {
  block: ImageBlockType
  onUpdate: (data: Partial<ImageBlockType>) => void
  isPending?: boolean
}

export function Image({ block, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();
  const size = block.size ?? "medium";

  return (
    <div className={`${styles.section} ${styles[size]}`}>
      <div className={styles.container}>
        {isPending && !block.image
          ? <ImageLoader isPending aspectRatio="16/9" className={styles.img} />
          : isEditable
            ? (
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
            )
            : block.image
              ? (
                <>
                  <ImageLoader image={block.image} isPending={false} className={styles.img} />
                  {block.image.provider && (
                    <span className={styles.attribution}>
                      via
                      {" "}
                      {block.image.provider}
                    </span>
                  )}
                </>
              )
              : null}
      </div>
      <EditableText
        value={block.caption ?? ""}
        onChange={v => onUpdate({ caption: v || undefined })}
        as="figcaption"
        className={styles.caption}
        placeholder="Add caption..."
      />
    </div>
  );
}
