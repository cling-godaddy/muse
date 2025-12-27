import { useEffect, useRef } from "react";
import type { FeaturesBlock as FeaturesBlockType, FeatureItem } from "@muse/core";
import styles from "./Features.module.css";

interface Props {
  block: FeaturesBlockType
  onUpdate: (data: Partial<FeaturesBlockType>) => void
}

function useAutoResize<T extends HTMLTextAreaElement>(ref: React.RefObject<T | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}

interface FeatureCardProps {
  item: FeatureItem
  onUpdate: (data: Partial<FeatureItem>) => void
  onRemove: () => void
}

function FeatureCard({ item, onUpdate, onRemove }: FeatureCardProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  useAutoResize(titleRef, item.title);
  useAutoResize(descRef, item.description);

  return (
    <div className={styles.item}>
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
            onChange={e => onUpdate({ icon: e.target.value || undefined })}
            placeholder="Icon..."
          />
        )}
      <textarea
        ref={titleRef}
        className={styles.itemTitle}
        rows={1}
        value={item.title}
        onChange={e => onUpdate({ title: e.target.value })}
        placeholder="Title..."
      />
      <textarea
        ref={descRef}
        className={styles.itemDescription}
        rows={2}
        value={item.description}
        onChange={e => onUpdate({ description: e.target.value })}
        placeholder="Description..."
      />
      <button
        type="button"
        onClick={onRemove}
        className={styles.removeButton}
      >
        Remove
      </button>
    </div>
  );
}

export function Features({ block, onUpdate }: Props) {
  const headlineRef = useRef<HTMLTextAreaElement>(null);
  useAutoResize(headlineRef, block.headline ?? "");

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
          <FeatureCard
            key={i}
            item={item}
            onUpdate={data => updateItem(i, data)}
            onRemove={() => removeItem(i)}
          />
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
