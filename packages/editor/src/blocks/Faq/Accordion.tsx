import { useState } from "react";
import type { FaqBlock as FaqBlockType, FaqItem } from "@muse/core";
import { useIsEditable } from "../../context/EditorModeContext";
import { EditableText } from "../../ux";
import styles from "./Accordion.module.css";

interface Props {
  block: FaqBlockType
  onUpdate: (data: Partial<FaqBlockType>) => void
}

export function Accordion({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();
  const [openIndex, setOpenIndex] = useState<number | null>(isEditable ? 0 : null);

  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const toggle = (index: number) => {
    if (!isEditable) {
      setOpenIndex(openIndex === index ? null : index);
    }
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
      <div className={styles.items}>
        {block.items.map((item, i) => {
          const isOpen = isEditable || openIndex === i;
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.open : ""}`}>
              <button
                type="button"
                className={styles.trigger}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
              >
                {isEditable
                  ? (
                    <EditableText
                      value={item.question}
                      onChange={v => updateItem(i, { question: v })}
                      as="span"
                      className={styles.question}
                      placeholder="Question?"
                    />
                  )
                  : (
                    <span className={styles.question}>{item.question}</span>
                  )}
                <span className={styles.icon} aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className={styles.content}>
                  <EditableText
                    value={item.answer}
                    onChange={v => updateItem(i, { answer: v })}
                    as="p"
                    className={styles.answer}
                    placeholder="Answer..."
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
