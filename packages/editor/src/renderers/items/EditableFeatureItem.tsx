import type { FeatureItem, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableRichText } from "../fields/EditableRichText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: FeatureItem
  onChange: (item: FeatureItem) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
  className?: string
}

export function EditableFeatureItem({
  item,
  onChange,
  onRemove,
  onUsage,
  className,
}: Props) {
  const handleFieldChange = <K extends keyof FeatureItem>(field: K, value: FeatureItem[K]) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className={className}>
      {item.image
        ? (
          <EditableImage
            value={item.image}
            onChange={v => handleFieldChange("image", v)}
            onRemove={() => handleFieldChange("image", undefined)}
            onUsage={onUsage}
          />
        )
        : (
          <EditablePlainText
            value={item.icon ?? ""}
            onChange={v => handleFieldChange("icon", v || undefined)}
            placeholder="Icon..."
          />
        )}
      <EditablePlainText
        value={item.title}
        onChange={v => handleFieldChange("title", v)}
        placeholder="Feature title..."
      />
      <EditableRichText
        value={item.description}
        onChange={v => handleFieldChange("description", v)}
        placeholder="Feature description..."
        elementType="description"
      />
      {onRemove && (
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  );
}
