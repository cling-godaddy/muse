import type { FaqSection as FaqSectionType, FaqItem } from "@muse/core";
import { EditableText } from "../../ux";
import styles from "./TwoColumn.module.css";

interface Props {
  block: FaqSectionType
  onUpdate: (data: Partial<FaqSectionType>) => void
}

export function TwoColumn({ block, onUpdate }: Props) {
  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
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
      {block.subheadline !== undefined && (
        <EditableText
          value={block.subheadline}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Subheadline..."
        />
      )}
      <div className={styles.grid}>
        {block.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <EditableText
              value={item.question}
              onChange={v => updateItem(i, { question: v })}
              as="h3"
              className={styles.question}
              placeholder="Question?"
            />
            <EditableText
              value={item.answer}
              onChange={v => updateItem(i, { answer: v })}
              as="p"
              className={styles.answer}
              placeholder="Answer..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
