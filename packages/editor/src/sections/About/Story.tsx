import type { AboutSection as AboutSectionType, ImageSource, RichContent, Usage } from "@muse/core";
import { Image } from "../../controls/Image";
import { EditableText } from "../../ux";
import styles from "./Story.module.css";

interface Props {
  section: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

export function Story({ section, onUpdate, trackUsage }: Props) {
  const handleImageUpdate = (image: ImageSource) => {
    onUpdate({ image });
  };

  const handleImageRemove = () => {
    onUpdate({ image: undefined });
  };

  return (
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        rich
        hideLists
        value={section.headline ?? ""}
        onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
        as="h2"
        className={styles.headline}
        placeholder="About Us"
        elementType="headline"
      />

      {section.image && (
        <Image
          image={section.image}
          onUpdate={handleImageUpdate}
          onRemove={handleImageRemove}
          onUsage={trackUsage}
          className={styles.image}
        />
      )}

      <EditableText
        rich
        value={section.body ?? ""}
        onChange={(v: RichContent) => onUpdate({ body: v.text ? v : undefined })}
        as="p"
        className={styles.body}
        placeholder="Tell your story..."
        elementType="description"
      />
    </section>
  );
}
