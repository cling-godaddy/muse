import type { FeatureItem, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableRichText } from "../fields/EditableRichText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: FeatureItem
  onChange: (item: FeatureItem) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
}

export function EditableFeatureItem({
  item,
  onChange,
  onRemove,
  onUsage,
}: Props) {
  const handleFieldChange = <K extends keyof FeatureItem>(field: K, value: FeatureItem[K]) => {
    onChange({ ...item, [field]: value });
  };

  // Structure uses data attributes for CSS targeting (cross-package)
  // Features.module.css styles these via [data-feature-*] selectors
  return (
    <>
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
          <div data-feature-icon="">
            <EditablePlainText
              value={item.icon ?? ""}
              onChange={v => handleFieldChange("icon", v || undefined)}
              placeholder="Icon..."
            />
          </div>
        )}
      <div data-feature-content="">
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
      </div>
      {onRemove && (
        <button type="button" data-feature-remove="" onClick={onRemove}>
          ×
        </button>
      )}
    </>
  );
}
