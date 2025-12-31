import type { FaqBlock as FaqBlockType, FaqItem } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Faq.module.css";

interface Props {
  block: FaqBlockType
  onUpdate: (data: Partial<FaqBlockType>) => void
}

export function Faq({ block, onUpdate }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");
  const subheadlineRef = useAutoResize(block.subheadline ?? "");

  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <textarea
          ref={headlineRef}
          className={styles.headline}
          rows={1}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <textarea
          ref={subheadlineRef}
          className={styles.subheadline}
          rows={1}
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
