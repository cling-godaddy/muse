import { useEffect, useRef } from "react";
import type { FeaturesBlock as FeaturesBlockType, FeatureItem } from "@muse/core";
import styles from "./Features.module.css";

interface Props {
  block: FeaturesBlockType
  onUpdate: (data: Partial<FeaturesBlockType>) => void
}

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

export function Features({ block, onUpdate }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");

  const updateItem = (index: number, data: Partial<FeatureItem>) => {
    const items = block.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const addItem = () => {
    onUpdate({
      items: [...block.items, { title: "", description: "" }],
    });
  };

  const removeItem = (index: number) => {
    onUpdate({
      items: block.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.section}>
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline ?? ""}
        onChange={e => onUpdate({ headline: e.target.value || undefined })}
        placeholder="Section headline..."
      />
      <div className={styles.grid}>
        {block.items.map((item, i) => (
          <div key={i} className={styles.item}>
            {item.image
              ? (
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  className={styles.itemImage}
                />
              )
              : (
                <input
                  type="text"
                  className={styles.itemIcon}
                  value={typeof item.icon === "string" ? item.icon : ""}
                  onChange={e => updateItem(i, { icon: e.target.value || undefined })}
                  placeholder="Icon..."
                />
              )}
            <input
              type="text"
              className={styles.itemTitle}
              value={item.title}
              onChange={e => updateItem(i, { title: e.target.value })}
              placeholder="Title..."
            />
            <textarea
              className={styles.itemDescription}
              value={item.description}
              onChange={e => updateItem(i, { description: e.target.value })}
              placeholder="Description..."
              rows={2}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className={styles.addButton}
      >
        Add Feature
      </button>
    </div>
  );
}
