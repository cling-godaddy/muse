import type { ProductsSection as ProductsSectionType, ProductItem, RichContent, ImageSource, Usage } from "@muse/core";
import { Image } from "../controls/Image";
import { EditableText, ImageLoader } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Products.module.css";

interface Props {
  section: ProductsSectionType
  onUpdate: (data: Partial<ProductsSectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

interface ProductCardProps {
  item: ProductItem
  onUpdate: (data: Partial<ProductItem>) => void
  onRemove: () => void
  preset: string
  isPending?: boolean
  isHero?: boolean
  trackUsage?: (usage: Usage) => void
}

function ProductCard({ item, onUpdate, onRemove, preset, isPending, isHero, trackUsage }: ProductCardProps) {
  const isEditable = useIsEditable();
  const isMinimal = preset === "products-minimal";

  const handleImageUpdate = (image: ImageSource) => {
    onUpdate({ image });
  };

  const handleImageRemove = () => {
    onUpdate({ image: undefined });
  };

  return (
    <div className={`${styles.card} ${isHero ? styles.heroCard : ""}`}>
      {isPending && !item.image
        ? <ImageLoader isPending className={styles.cardImage} />
        : item.image?.url
          ? <Image image={item.image} onUpdate={handleImageUpdate} onRemove={handleImageRemove} onUsage={trackUsage} className={styles.cardImage} />
          : <div className={styles.cardImagePlaceholder} />}

      {item.badge && (
        <span className={styles.badge}>{item.badge}</span>
      )}

      <div className={styles.cardContent}>
        {!isMinimal && (
          <EditableText
            value={item.name}
            onChange={v => onUpdate({ name: v })}
            as="h3"
            className={styles.cardName}
            placeholder="Product name..."
          />
        )}

        <div className={styles.cardPricing}>
          <EditableText
            value={item.price}
            onChange={v => onUpdate({ price: v })}
            as="span"
            className={styles.cardPrice}
            placeholder="$0"
          />
          {item.originalPrice && (
            <EditableText
              value={item.originalPrice}
              onChange={v => onUpdate({ originalPrice: v || undefined })}
              as="span"
              className={styles.cardOriginalPrice}
              placeholder="$0"
            />
          )}
        </div>

        {!isMinimal && item.rating !== undefined && (
          <div className={styles.cardRating}>
            <span className={styles.stars}>{"★".repeat(Math.round(item.rating))}</span>
            <span className={styles.ratingValue}>{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {isEditable && (
        <button
          type="button"
          onClick={onRemove}
          className={styles.removeButton}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function Products({ section, onUpdate, isPending, trackUsage }: Props) {
  const isEditable = useIsEditable();
  const preset = section.preset ?? "products-grid";

  const layoutClass = ({
    "products-grid": styles.grid,
    "products-featured": styles.featured,
    "products-minimal": styles.minimal,
  } as Record<string, string>)[preset] ?? styles.grid;

  const updateItem = (index: number, data: Partial<ProductItem>) => {
    const items = section.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const removeItem = (index: number) => {
    onUpdate({ items: section.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    const newItem: ProductItem = {
      image: { url: "", alt: "" },
      name: "",
      price: "",
    };
    onUpdate({ items: [...section.items, newItem] });
  };

  return (
    <div className={`${styles.section} ${layoutClass}`} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          rich
          hideLists
          value={section.headline}
          onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      {section.subheadline !== undefined && (
        <EditableText
          value={section.subheadline}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Subheadline..."
        />
      )}

      <div className={styles.cards}>
        {section.items.map((item, i) => (
          <ProductCard
            key={i}
            item={item}
            onUpdate={data => updateItem(i, data)}
            onRemove={() => removeItem(i)}
            preset={preset}
            isPending={isPending}
            isHero={preset === "products-featured" && i === 0}
            trackUsage={trackUsage}
          />
        ))}
      </div>

      {isEditable && (
        <button
          type="button"
          onClick={addItem}
          className={styles.addButton}
        >
          + Add Product
        </button>
      )}
    </div>
  );
}
