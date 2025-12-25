import { useEffect, useRef } from "react";
import type { FeaturesBlock as FeaturesBlockType, FeatureItem } from "@muse/core";

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

export function FeaturesBlock({ block, onUpdate }: Props) {
  const columns = block.columns ?? 3;
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
    <div className="muse-block-features">
      <textarea
        ref={headlineRef}
        className="muse-block-features-headline"
        rows={1}
        value={block.headline ?? ""}
        onChange={e => onUpdate({ headline: e.target.value || undefined })}
        placeholder="Section headline..."
      />
      <div
        className="muse-block-features-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {block.items.map((item, i) => (
          <div key={i} className="muse-block-features-item">
            <input
              type="text"
              value={item.icon ?? ""}
              onChange={e => updateItem(i, { icon: e.target.value || undefined })}
              placeholder="Icon..."
            />
            <input
              type="text"
              value={item.title}
              onChange={e => updateItem(i, { title: e.target.value })}
              placeholder="Title..."
            />
            <textarea
              value={item.description}
              onChange={e => updateItem(i, { description: e.target.value })}
              placeholder="Description..."
              rows={2}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="muse-block-features-remove"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="muse-block-features-add"
      >
        Add Feature
      </button>
    </div>
  );
}
