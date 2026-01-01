import type { FeaturesSection as FeaturesSectionType, FeatureItem } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import styles from "./Grid.module.css";

interface Props {
  block: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
}

interface FeatureCardProps {
  item: FeatureItem
  onUpdate: (data: Partial<FeatureItem>) => void
  onRemove: () => void
  isPending?: boolean
}

function FeatureCard({ item, onUpdate, onRemove, isPending }: FeatureCardProps) {
  const isEditable = useIsEditable();

  return (
    <div className={styles.item}>
      {isPending && !item.image
        ? <ImageLoader isPending className={styles.itemImage} />
        : item.image
          ? <ImageLoader image={item.image} isPending={false} className={styles.itemImage} />
          : isEditable
            ? (
              <input
                type="text"
                className={styles.itemIcon}
                value={typeof item.icon === "string" ? item.icon : ""}
                onChange={e => onUpdate({ icon: e.target.value || undefined })}
                placeholder="Icon..."
              />
            )
            : item.icon
              ? <FeatureIcon name={item.icon} size={32} className={styles.itemIcon} />
              : null}
      <EditableText
        value={item.title}
        onChange={v => onUpdate({ title: v })}
        as="h3"
        className={styles.itemTitle}
        placeholder="Title..."
      />
      <EditableText
        value={item.description}
        onChange={v => onUpdate({ description: v })}
        as="p"
        className={styles.itemDescription}
        placeholder="Description..."
      />
      {isEditable && (
        <button
          type="button"
          onClick={onRemove}
          className={styles.removeButton}
        >
          Remove
        </button>
      )}
    </div>
  );
}

export function Grid({ block, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

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
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Section headline..."
      />
      <div className={styles.grid}>
        {block.items.map((item, i) => (
          <FeatureCard
            key={i}
            item={item}
            onUpdate={data => updateItem(i, data)}
            onRemove={() => removeItem(i)}
            isPending={isPending}
          />
        ))}
      </div>
      {isEditable && (
        <button
          type="button"
          onClick={addItem}
          className={styles.addButton}
        >
          Add Feature
        </button>
      )}
    </div>
  );
}
