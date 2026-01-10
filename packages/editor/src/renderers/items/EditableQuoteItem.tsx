import type { Quote, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: Quote
  onChange: (item: Quote) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
}

export function EditableQuoteItem({
  item,
  onChange,
  onRemove,
  onUsage,
}: Props) {
  const handleFieldChange = <K extends keyof Quote>(field: K, value: Quote[K]) => {
    onChange({ ...item, [field]: value });
  };

  // Structure uses data attributes for CSS targeting (cross-package)
  // Testimonials.module.css styles these via [data-quote-*] selectors
  return (
    <>
      <div data-quote-text="">
        <EditablePlainText
          value={item.text}
          onChange={v => handleFieldChange("text", v)}
          placeholder="Testimonial quote..."
        />
      </div>
      <div data-quote-author="">
        <div data-quote-avatar="">
          <EditableImage
            value={item.avatar}
            onChange={v => handleFieldChange("avatar", v)}
            onRemove={() => handleFieldChange("avatar", undefined)}
            onUsage={onUsage}
            trigger={!item.avatar
              ? (
                <button type="button" data-quote-avatar-placeholder="">
                  {item.author?.charAt(0)?.toUpperCase() || "?"}
                </button>
              )
              : undefined}
          />
        </div>
        <div data-quote-info="">
          <EditablePlainText
            value={item.author}
            onChange={v => handleFieldChange("author", v)}
            placeholder="Author name"
          />
          <div data-quote-meta="">
            <EditablePlainText
              value={item.role ?? ""}
              onChange={v => handleFieldChange("role", v || undefined)}
              placeholder="Role"
              multiline={false}
            />
            {item.company !== undefined && (
              <>
                <span data-quote-separator="">, </span>
                <EditablePlainText
                  value={item.company ?? ""}
                  onChange={v => handleFieldChange("company", v || undefined)}
                  placeholder="Company"
                  multiline={false}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {onRemove && (
        <button type="button" data-quote-remove="" onClick={onRemove}>
          ×
        </button>
      )}
    </>
  );
}
