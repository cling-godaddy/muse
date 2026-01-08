import type { FaqSection as FaqSectionType, FaqItem, RichContent } from "@muse/core";
import { EditableText } from "../../ux";
import styles from "./TwoColumn.module.css";

interface Props {
  section: FaqSectionType
  onUpdate: (data: Partial<FaqSectionType>) => void
}

export function TwoColumn({ section, onUpdate }: Props) {
  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = section.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          value={section.headline}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      {section.subheadline !== undefined && (
        <EditableText
          value={section.subheadline}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Subheadline..."
        />
      )}
      <div className={styles.grid}>
        {section.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <EditableText
              value={item.question}
              onChange={v => updateItem(i, { question: v })}
              as="h3"
              className={styles.question}
              placeholder="Question?"
            />
            <EditableText
              rich
              value={item.answer}
              onChange={(v: RichContent) => updateItem(i, { answer: v })}
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
