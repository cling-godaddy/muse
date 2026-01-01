import type { AboutSection as AboutSectionType } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Story.module.css";

interface Props {
  section: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
}

export function Story({ section, onUpdate, isPending }: Props) {
  return (
    <section className={styles.section}>
      <EditableText
        value={section.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="About Us"
      />

      {section.image && (
        <ImageLoader image={section.image} isPending={!!isPending} className={styles.image} />
      )}

      <EditableText
        value={section.body ?? ""}
        onChange={v => onUpdate({ body: v || undefined })}
        as="p"
        className={styles.body}
        placeholder="Tell your story..."
      />
    </section>
  );
}
