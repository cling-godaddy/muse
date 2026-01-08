import { useState, useCallback } from "react";
import type { FeaturesSection as FeaturesSectionType, FeatureItem, RichContent, Site, Usage } from "@muse/core";
import { EditableText, Skeleton } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import { AddItemPopover } from "../../controls/AddItemPopover";
import styles from "./Numbered.module.css";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
  site?: Site
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
}

export function Numbered({ section, onUpdate, site, getToken, trackUsage }: Props) {
  const isEditable = useIsEditable();
  const [isGenerating, setIsGenerating] = useState(false);

  const updateItem = (index: number, data: Partial<FeatureItem>) => {
    const items = section.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const addItem = useCallback(async (useAI: boolean) => {
    if (useAI && getToken && site) {
      setIsGenerating(true);
      try {
        const token = await getToken();
        const response = await fetch("/api/chat/generate-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemType: "feature",
            siteContext: {
              name: site.name,
              description: site.description,
              location: site.location,
            },
            sectionContext: {
              preset: section.preset,
              existingItems: section.items.map(item => ({
                title: item.title,
                description: typeof item.description === "string" ? item.description : "",
              })),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate item");
        }

        const data = await response.json();

        // Track usage cost
        if (data.usage && trackUsage) {
          trackUsage(data.usage);
        }

        onUpdate({
          items: [...section.items, data.item],
        });
      }
      catch (err) {
        console.error("Failed to generate feature:", err);
        // Fallback to blank item
        onUpdate({
          items: [...section.items, { title: "", description: "" }],
        });
      }
      finally {
        setIsGenerating(false);
      }
    }
    else {
      // Add blank item
      onUpdate({
        items: [...section.items, { title: "", description: "" }],
      });
    }
  }, [getToken, site, section.items, section.preset, onUpdate, trackUsage]);

  const removeItem = (index: number) => {
    onUpdate({
      items: section.items.filter((_, i) => i !== index),
    });
  };

  return (
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        rich
        hideLists
        elementType="headline"
        value={section.headline ?? ""}
        onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
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
                rich
                elementType="description"
                value={item.description}
                onChange={(v: RichContent) => updateItem(i, { description: v })}
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
        {isGenerating && (
          <div className={styles.step}>
            <div className={styles.number}>{section.items.length + 1}</div>
            <div className={styles.content}>
              <div className={styles.header}>
                <Skeleton variant="rect" height="24px" width="24px" className={styles.icon} />
                <Skeleton variant="text" height="1.5em" width="60%" className={styles.title} />
              </div>
              <Skeleton variant="text" height="1em" width="100%" className={styles.description} />
              <Skeleton variant="text" height="1em" width="90%" className={styles.description} />
            </div>
          </div>
        )}
      </div>

      {isEditable && (
        <AddItemPopover
          itemType="Step"
          onAdd={addItem}
          disabled={isGenerating}
        />
      )}
    </section>
  );
}
