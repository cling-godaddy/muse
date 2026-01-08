import { useState } from "react";
import type { FaqSection as FaqSectionType, FaqItem, RichContent } from "@muse/core";
import { useIsEditable } from "../../context/EditorMode";
import { EditableText } from "../../ux";
import styles from "./Accordion.module.css";

interface Props {
  section: FaqSectionType
  onUpdate: (data: Partial<FaqSectionType>) => void
}

export function Accordion({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();
  const [openIndex, setOpenIndex] = useState<number | null>(isEditable ? 0 : null);

  const updateItem = (index: number, data: Partial<FaqItem>) => {
    const items = section.items.map((item, i) =>
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
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          rich
          hideLists
          value={section.headline}
          onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
          elementType="headline"
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
      <div className={styles.items}>
        {section.items.map((item, i) => {
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
                    rich
                    value={item.answer}
                    onChange={(v: RichContent) => updateItem(i, { answer: v })}
                    as="p"
                    className={styles.answer}
                    placeholder="Answer..."
                    elementType="description"
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
