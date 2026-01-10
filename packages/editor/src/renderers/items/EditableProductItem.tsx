import type { ProductItem, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: ProductItem
  onChange: (item: ProductItem) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
  className?: string
}

export function EditableProductItem({
  item,
  onChange,
  onRemove,
  onUsage,
  className,
}: Props) {
  const handleFieldChange = <K extends keyof ProductItem>(field: K, value: ProductItem[K]) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className={className}>
      <EditableImage
        value={item.image}
        onChange={v => handleFieldChange("image", v)}
        onUsage={onUsage}
      />
      <EditablePlainText
        value={item.name}
        onChange={v => handleFieldChange("name", v)}
        placeholder="Product name..."
      />
      <EditablePlainText
        value={item.price}
        onChange={v => handleFieldChange("price", v)}
        placeholder="$0.00"
      />
      {item.originalPrice !== undefined && (
        <EditablePlainText
          value={item.originalPrice}
          onChange={v => handleFieldChange("originalPrice", v || undefined)}
          placeholder="Original price..."
        />
      )}
      {item.badge !== undefined && (
        <EditablePlainText
          value={item.badge}
          onChange={v => handleFieldChange("badge", v || undefined)}
          placeholder="Badge..."
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
