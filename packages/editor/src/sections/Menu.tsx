import type { MenuSection as MenuSectionType, MenuItem, MenuCategory, RichContent } from "@muse/core";
import { EditableText, ImageLoader } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Menu.module.css";

interface Props {
  section: MenuSectionType
  onUpdate: (data: Partial<MenuSectionType>) => void
  isPending?: boolean
}

interface MenuItemRowProps {
  item: MenuItem
  onUpdate: (data: Partial<MenuItem>) => void
  onRemove: () => void
  preset: string
  isPending?: boolean
}

function MenuItemRow({ item, onUpdate, onRemove, preset, isPending }: MenuItemRowProps) {
  const isEditable = useIsEditable();
  const isCards = preset === "menu-cards";
  const isSimple = preset === "menu-simple";

  return (
    <div className={styles.item}>
      {isCards && (
        isPending && !item.image
          ? <ImageLoader isPending className={styles.itemImage} />
          : item.image
            ? <ImageLoader image={item.image} isPending={false} className={styles.itemImage} />
            : null
      )}
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <EditableText
            value={item.name}
            onChange={v => onUpdate({ name: v })}
            as="span"
            className={styles.itemName}
            placeholder="Item name..."
          />
          {!isCards && <span className={styles.itemDots} />}
          <EditableText
            value={item.price}
            onChange={v => onUpdate({ price: v })}
            as="span"
            className={styles.itemPrice}
            placeholder="$0"
          />
        </div>
        {!isSimple && item.description !== undefined && (
          <EditableText
            rich
            value={item.description ?? ""}
            onChange={(v: RichContent) => onUpdate({ description: v.text ? v : undefined })}
            as="p"
            className={styles.itemDescription}
            placeholder="Description..."
          />
        )}
        {!isSimple && item.tags && item.tags.length > 0 && (
          <div className={styles.itemTags}>
            {item.tags.map((tag, i) => (
              <span key={i} className={styles.tag}>{tag}</span>
            ))}
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

export function Menu({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();
  const preset = section.preset ?? "menu-list";

  const layoutClass = ({
    "menu-list": styles.list,
    "menu-cards": styles.cards,
    "menu-simple": styles.simple,
  } as Record<string, string>)[preset] ?? styles.list;

  const updateItem = (categoryIndex: number | null, itemIndex: number, data: Partial<MenuItem>) => {
    if (section.categories && categoryIndex !== null) {
      const categories = section.categories.map((cat, ci) =>
        ci === categoryIndex
          ? { ...cat, items: cat.items.map((item, ii) => ii === itemIndex ? { ...item, ...data } : item) }
          : cat,
      );
      onUpdate({ categories });
    }
    else if (section.items) {
      const items = section.items.map((item, i) =>
        i === itemIndex ? { ...item, ...data } : item,
      );
      onUpdate({ items });
    }
  };

  const removeItem = (categoryIndex: number | null, itemIndex: number) => {
    if (section.categories && categoryIndex !== null) {
      const categories = section.categories.map((cat, ci) =>
        ci === categoryIndex
          ? { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) }
          : cat,
      );
      onUpdate({ categories });
    }
    else if (section.items) {
      onUpdate({ items: section.items.filter((_, i) => i !== itemIndex) });
    }
  };

  const addItem = (categoryIndex: number | null) => {
    const newItem: MenuItem = { name: "", price: "" };
    if (section.categories && categoryIndex !== null) {
      const categories = section.categories.map((cat, ci) =>
        ci === categoryIndex
          ? { ...cat, items: [...cat.items, newItem] }
          : cat,
      );
      onUpdate({ categories });
    }
    else if (section.items) {
      onUpdate({ items: [...section.items, newItem] });
    }
    else {
      onUpdate({ items: [newItem] });
    }
  };

  const updateCategoryName = (categoryIndex: number, name: string) => {
    if (section.categories) {
      const categories = section.categories.map((cat, i) =>
        i === categoryIndex ? { ...cat, name } : cat,
      );
      onUpdate({ categories });
    }
  };

  const addCategory = () => {
    const newCategory: MenuCategory = { name: "", items: [] };
    onUpdate({ categories: [...(section.categories ?? []), newCategory] });
  };

  const removeCategory = (categoryIndex: number) => {
    if (section.categories) {
      onUpdate({ categories: section.categories.filter((_, i) => i !== categoryIndex) });
    }
  };

  const renderItems = (items: MenuItem[], categoryIndex: number | null) => (
    <div className={styles.items}>
      {items.map((item, i) => (
        <MenuItemRow
          key={i}
          item={item}
          onUpdate={data => updateItem(categoryIndex, i, data)}
          onRemove={() => removeItem(categoryIndex, i)}
          preset={preset}
          isPending={isPending}
        />
      ))}
      {isEditable && (
        <button
          type="button"
          onClick={() => addItem(categoryIndex)}
          className={styles.addItemButton}
        >
          + Add Item
        </button>
      )}
    </div>
  );

  return (
    <div className={`${styles.section} ${layoutClass}`}>
      {section.headline !== undefined && (
        <EditableText
          value={section.headline}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Menu headline..."
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

      {section.categories && section.categories.length > 0
        ? (
          <div className={styles.categories}>
            {section.categories.map((category, ci) => (
              <div key={ci} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <EditableText
                    value={category.name}
                    onChange={v => updateCategoryName(ci, v)}
                    as="h3"
                    className={styles.categoryName}
                    placeholder="Category name..."
                  />
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => removeCategory(ci)}
                      className={styles.removeCategoryButton}
                    >
                      Remove Category
                    </button>
                  )}
                </div>
                {renderItems(category.items, ci)}
              </div>
            ))}
            {isEditable && (
              <button
                type="button"
                onClick={addCategory}
                className={styles.addCategoryButton}
              >
                + Add Category
              </button>
            )}
          </div>
        )
        : section.items
          ? renderItems(section.items, null)
          : (
            isEditable && (
              <div className={styles.empty}>
                <button type="button" onClick={() => addItem(null)} className={styles.addItemButton}>
                  + Add Item
                </button>
                <button type="button" onClick={addCategory} className={styles.addCategoryButton}>
                  + Add Category
                </button>
              </div>
            )
          )}
    </div>
  );
}
