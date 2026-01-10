import type { ProductItem, Usage } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";
import { EditableImage } from "../fields/EditableImage";

interface Props {
  item: ProductItem
  onChange: (item: ProductItem) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
}

export function EditableProductItem({
  item,
  onChange,
  onRemove,
  onUsage,
}: Props) {
  const handleFieldChange = <K extends keyof ProductItem>(field: K, value: ProductItem[K]) => {
    onChange({ ...item, [field]: value });
  };

  // Structure uses data attributes for CSS targeting (cross-package)
  // Products.module.css styles these via [data-product-*] selectors
  return (
    <>
      <EditableImage
        value={item.image}
        onChange={v => handleFieldChange("image", v)}
        onUsage={onUsage}
      />
      {item.badge !== undefined && (
        <span data-product-badge="">
          <EditablePlainText
            value={item.badge}
            onChange={v => handleFieldChange("badge", v || undefined)}
            placeholder="Badge"
            multiline={false}
          />
        </span>
      )}
      <div data-product-content="">
        <EditablePlainText
          value={item.name}
          onChange={v => handleFieldChange("name", v)}
          placeholder="Product name..."
        />
        <div data-product-pricing="">
          <EditablePlainText
            value={item.price}
            onChange={v => handleFieldChange("price", v)}
            placeholder="$0.00"
          />
          {item.originalPrice !== undefined && (
            <EditablePlainText
              value={item.originalPrice}
              onChange={v => handleFieldChange("originalPrice", v || undefined)}
              placeholder="Was $..."
            />
          )}
        </div>
      </div>
      {onRemove && (
        <button type="button" data-product-remove="" onClick={onRemove}>
          ×
        </button>
      )}
    </>
  );
}
