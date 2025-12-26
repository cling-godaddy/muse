import type { FaqBlock as FaqBlockType, FaqItem } from "@muse/core";
import styles from "./Faq.module.css";

interface Props {
  block: FaqBlockType
  onUpdate: (data: Partial<FaqBlockType>) => void
}

export function Faq({ block, onUpdate }: Props) {
  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <input
          type="text"
          className={styles.headline}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <input
          type="text"
          className={styles.subheadline}
          value={block.subheadline}
          onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
          placeholder="Subheadline..."
        />
      )}
      <div className={styles.items}>
        {block.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <input
              type="text"
              className={styles.question}
              value={item.question}
              onChange={e => updateItem(i, { question: e.target.value })}
              placeholder="Question?"
            />
            <textarea
              className={styles.answer}
              value={item.answer}
              onChange={e => updateItem(i, { answer: e.target.value })}
              placeholder="Answer..."
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
