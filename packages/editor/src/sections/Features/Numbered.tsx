import type { FeaturesSection as FeaturesSectionType, FeatureItem } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import styles from "./Numbered.module.css";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
}

export function Numbered({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

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
    <section className={styles.section}>
      <EditableText
        value={section.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="How It Works"
      />

      <div className={styles.list}>
        {section.items.map((item, i) => (
          <div key={i} className={styles.step}>
            <div className={styles.number}>{i + 1}</div>
            <div className={styles.content}>
              <div className={styles.header}>
                {isEditable
                  ? (
                    <input
                      type="text"
                      className={styles.iconInput}
                      value={typeof item.icon === "string" ? item.icon : ""}
                      onChange={e => updateItem(i, { icon: e.target.value || undefined })}
                      placeholder="Icon..."
                    />
                  )
                  : item.icon
                    ? <FeatureIcon name={item.icon} size={24} className={styles.icon} />
                    : null}
                <EditableText
                  value={item.title}
                  onChange={v => updateItem(i, { title: v })}
                  as="h3"
                  className={styles.title}
                  placeholder="Step title..."
                />
              </div>
              <EditableText
                value={item.description}
                onChange={v => updateItem(i, { description: v })}
                as="p"
                className={styles.description}
                placeholder="Step description..."
              />
              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditable && (
        <button type="button" onClick={addItem} className={styles.addButton}>
          Add Step
        </button>
      )}
    </section>
  );
}
