import { useState, useCallback } from "react";
import type { FeaturesSection as FeaturesSectionType, FeatureItem, RichContent, Site, Usage } from "@muse/core";
import { EditableText, ImageLoader, Skeleton } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import { FeatureIcon } from "./icons";
import { AddItemPopover } from "../../controls/AddItemPopover";
import styles from "./Grid.module.css";

interface Props {
  section: FeaturesSectionType
  onUpdate: (data: Partial<FeaturesSectionType>) => void
  isPending?: boolean
  site?: Site
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
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

export function Grid({ section, onUpdate, isPending, site, getToken, trackUsage }: Props) {
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

  // Show section-level skeleton when empty array during generation
  if (isPending && section.items.length === 0) {
    return (
      <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
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

  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {isPending
        ? <Skeleton variant="text" height="2em" width="50%" className={styles.headline} />
        : (
          <EditableText
            rich
            hideLists
            value={section.headline ?? ""}
            onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
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
        {isGenerating && (
          <FeatureCard
            item={{ title: "", description: "" }}
            onUpdate={() => {}}
            onRemove={() => {}}
            isPending
          />
        )}
      </div>
      {isEditable && (
        <AddItemPopover
          itemType="Feature"
          onAdd={addItem}
          disabled={isGenerating}
        />
      )}
    </div>
  );
}
