import type { FeaturesSection as FeaturesSectionType, FeatureItem, RichContent } from "@muse/core";
import { EditableText, ImageLoader, Skeleton } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import styles from "./Grid.module.css";

interface Props {
  section: FeaturesSectionType
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

  if (isPending) {
    return (
      <div className={styles.item}>
        {item.image
          ? <ImageLoader image={item.image} isPending={false} className={styles.itemImage} />
          : <Skeleton variant="rect" height="48px" width="48px" className={styles.itemIcon} />}
        <Skeleton variant="text" height="1.5em" width="70%" className={styles.itemTitle} />
        <Skeleton variant="text" height="1em" width="100%" className={styles.itemDescription} />
        <Skeleton variant="text" height="1em" width="90%" />
      </div>
    );
  }

  return (
    <div className={styles.item}>
      {item.image
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
        rich
        value={item.description}
        onChange={(v: RichContent) => onUpdate({ description: v })}
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

export function Grid({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  // Show section-level skeleton when empty array during generation
  if (isPending && section.items.length === 0) {
    return (
      <div className={styles.section}>
        <Skeleton variant="text" height="2em" width="50%" className={styles.headline} />
        <div className={styles.grid}>
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.item}>
              <Skeleton variant="rect" height="48px" width="48px" className={styles.itemIcon} />
              <Skeleton variant="text" height="1.5em" width="70%" className={styles.itemTitle} />
              <Skeleton variant="text" height="1em" width="100%" className={styles.itemDescription} />
              <Skeleton variant="text" height="1em" width="90%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const updateItem = (index: number, data: Partial<FeatureItem>) => {
    const items = section.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const addItem = () => {
    onUpdate({
      items: [...section.items, { title: "", description: "" }],
    });
  };

  const removeItem = (index: number) => {
    onUpdate({
      items: section.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.section}>
      {isPending
        ? <Skeleton variant="text" height="2em" width="50%" className={styles.headline} />
        : (
          <EditableText
            value={section.headline ?? ""}
            onChange={v => onUpdate({ headline: v || undefined })}
            as="h2"
            className={styles.headline}
            placeholder="Section headline..."
          />
        )}
      <div className={styles.grid}>
        {section.items.map((item, i) => (
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
