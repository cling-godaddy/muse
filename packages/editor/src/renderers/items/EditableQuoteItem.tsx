import type { Quote, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: Quote
  onChange: (item: Quote) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
  className?: string
}

export function EditableQuoteItem({
  item,
  onChange,
  onRemove,
  onUsage,
  className,
}: Props) {
  const handleFieldChange = <K extends keyof Quote>(field: K, value: Quote[K]) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className={className}>
      <EditablePlainText
        value={item.text}
        onChange={v => handleFieldChange("text", v)}
        placeholder="Testimonial quote..."
      />
      <EditablePlainText
        value={item.author}
        onChange={v => handleFieldChange("author", v)}
        placeholder="Author name"
      />
      <EditablePlainText
        value={item.role ?? ""}
        onChange={v => handleFieldChange("role", v || undefined)}
        placeholder="Role"
      />
      <EditablePlainText
        value={item.company ?? ""}
        onChange={v => handleFieldChange("company", v || undefined)}
        placeholder="Company"
      />
      {item.avatar && (
        <EditableImage
          value={item.avatar}
          onChange={v => handleFieldChange("avatar", v)}
          onRemove={() => handleFieldChange("avatar", undefined)}
          onUsage={onUsage}
        />
      )}
      {onRemove && (
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  );
}
