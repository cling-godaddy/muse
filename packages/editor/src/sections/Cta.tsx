import type { CtaSection as CtaSectionType } from "@muse/core";
import { EditableText, EditableLink } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Cta.module.css";

interface Props {
  block: CtaSectionType
  onUpdate: (data: Partial<CtaSectionType>) => void
}

export function Cta({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();
  const variant = block.variant ?? "primary";
  const variantClass = variant === "primary" ? styles.primary : styles.secondary;

  return (
    <div className={`${styles.section} ${variantClass}`}>
      <EditableText
        value={block.headline}
        onChange={v => onUpdate({ headline: v })}
        as="h2"
        className={styles.headline}
        placeholder="CTA headline..."
      />
      <EditableText
        value={block.description ?? ""}
        onChange={v => onUpdate({ description: v || undefined })}
        as="p"
        className={styles.description}
        placeholder="Description..."
      />
      <EditableLink
        text={block.buttonText}
        href={block.buttonHref ?? "#"}
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
