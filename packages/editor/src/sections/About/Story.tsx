import type { AboutSection as AboutSectionType } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Story.module.css";

interface Props {
  block: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
}

export function Story({ block, onUpdate, isPending }: Props) {
  return (
    <section className={styles.section}>
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="About Us"
      />

      {block.image && (
        <ImageLoader image={block.image} isPending={!!isPending} className={styles.image} />
      )}

      <EditableText
        value={block.body ?? ""}
        onChange={v => onUpdate({ body: v || undefined })}
        as="p"
        className={styles.body}
        placeholder="Tell your story..."
      />
    </section>
  );
}
