import type { FeaturesSection as FeaturesSectionType, FeatureItem, RichContent } from "@muse/core";
import { EditableText, ImageLoader, Skeleton } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import styles from "./Bento.module.css";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
}

interface BentoCardProps {
  item: FeatureItem
  onUpdate: (data: Partial<FeatureItem>) => void
  onRemove: () => void
  isPending?: boolean
  isLarge?: boolean
}

function BentoCard({ item, onUpdate, onRemove, isPending, isLarge }: BentoCardProps) {
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
              ? <FeatureIcon name={item.icon} size={isLarge ? 48 : 32} className={styles.itemIcon} />
              : null}
      <div className={styles.itemContent}>
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
      </div>
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

const layoutClasses: Record<string, string> = {
  "features-bento": "bentoHero",
  "features-bento-spotlight": "bentoSpotlight",
  "features-bento-split": "bentoSplit",
};

export function Bento({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();
  const layoutClassName = layoutClasses[section.preset ?? "features-bento"] ?? "bentoHero";
  const layoutClass = (styles as Record<string, string>)[layoutClassName] ?? "";

  // Show section-level skeleton when empty array during generation
  if (isPending && section.items.length === 0) {
    return (
      <div className={styles.section}>
        <Skeleton variant="text" height="2em" width="50%" className={styles.headline} />
        <div className={`${styles.bento} ${layoutClass}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={styles.item}>
              <Skeleton variant="rect" height={i === 0 ? "64px" : "48px"} width={i === 0 ? "64px" : "48px"} className={styles.itemIcon} />
              <div className={styles.itemContent}>
                <Skeleton variant="text" height="1.5em" width="70%" className={styles.itemTitle} />
                <Skeleton variant="text" height="1em" width="100%" className={styles.itemDescription} />
                <Skeleton variant="text" height="1em" width="90%" />
              </div>
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
      <EditableText
        value={section.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Section headline..."
      />
      <div className={`${styles.bento} ${layoutClass}`}>
        {section.items.map((item, i) => (
          <BentoCard
            key={i}
            item={item}
            onUpdate={data => updateItem(i, data)}
            onRemove={() => removeItem(i)}
            isPending={isPending}
            isLarge={i === 0}
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
