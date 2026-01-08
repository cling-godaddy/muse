import type { CtaSection as CtaSectionType, RichContent } from "@muse/core";
import { EditableText, EditableLink, Skeleton } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Cta.module.css";

interface Props {
  section: CtaSectionType
  onUpdate: (data: Partial<CtaSectionType>) => void
  isPending?: boolean
}

export function Cta({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();
  const variant = section.variant ?? "primary";
  const variantClass = variant === "primary" ? styles.primary : styles.secondary;

  if (isPending) {
    return (
      <div className={`${styles.section} ${variantClass}`} style={{ backgroundColor: section.backgroundColor }}>
        <Skeleton variant="text" height="2.5em" width="60%" className={styles.headline} />
        <Skeleton variant="text" height="1.2em" width="80%" className={styles.description} />
        <Skeleton variant="rect" height="48px" width="180px" />
      </div>
    );
  }

  return (
    <div className={`${styles.section} ${variantClass}`} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        value={section.headline}
        onChange={v => onUpdate({ headline: v })}
        as="h2"
        className={styles.headline}
        placeholder="CTA headline..."
      />
      <EditableText
        rich
        value={section.description ?? ""}
        onChange={(v: RichContent) => onUpdate({ description: v.text ? v : undefined })}
        as="p"
        className={styles.description}
        placeholder="Description..."
      />
      <EditableLink
        text={section.buttonText}
        href={section.buttonHref ?? "#"}
        onTextChange={v => onUpdate({ buttonText: v })}
        className={styles.button}
        placeholder="Button text..."
      />
      {isEditable && (
        <select
          value={variant}
          onChange={e => onUpdate({ variant: e.target.value as "primary" | "secondary" })}
          className={styles.variantSelect}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
        </select>
      )}
    </div>
  );
}
