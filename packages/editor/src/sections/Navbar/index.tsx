import type { NavbarSection as NavbarSectionType, NavItem } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import {
  ItemPopover,
  PopoverField,
  PopoverInput,
  PopoverActions,
  PopoverButton,
} from "../../controls/ItemPopover";
import { Dropdown } from "./Dropdown";
import styles from "./Navbar.module.css";

interface Props {
  section: NavbarSectionType
  onUpdate: (data: Partial<NavbarSectionType>) => void
}

export function Navbar({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updateItem = (index: number, data: Partial<NavItem>) => {
    const items = section.items.map((item, i) =>
      i === index ? { ...item, ...data } : item,
    );
    onUpdate({ items });
  };

  const addItem = () => {
    onUpdate({ items: [...section.items, { label: "Link", href: "#" }] });
  };

  const removeItem = (index: number) => {
    onUpdate({ items: section.items.filter((_, i) => i !== index) });
  };

  const addChildItem = (parentIndex: number) => {
    const items = section.items.map((item, i) => {
      if (i !== parentIndex) return item;
      return {
        ...item,
        children: [...(item.children ?? []), { label: "Sublink", href: "#" }],
      };
    });
    onUpdate({ items });
  };

  const updateChildItem = (parentIndex: number, childIndex: number, data: Partial<NavItem>) => {
    const items = section.items.map((item, i) => {
      if (i !== parentIndex || !item.children) return item;
      return {
        ...item,
        children: item.children.map((child, ci) =>
          ci === childIndex ? { ...child, ...data } : child,
        ),
      };
    });
    onUpdate({ items });
  };

  const removeChildItem = (parentIndex: number, childIndex: number) => {
    const items = section.items.map((item, i) => {
      if (i !== parentIndex || !item.children) return item;
      return {
        ...item,
        children: item.children.filter((_, ci) => ci !== childIndex),
      };
    });
    onUpdate({ items });
  };

  const updateCta = (data: Partial<{ text: string, href: string }>) => {
    onUpdate({ cta: { ...section.cta, text: "", href: "#", ...data } });
  };

  return (
    <nav className={styles.navbar} data-sticky={section.sticky}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          {section.logo?.image
            ? (
              <img
                src={section.logo.image.url}
                alt={section.logo.image.alt}
                className={styles.logoImage}
              />
            )
            : (
              <EditableText
                value={section.logo?.text ?? ""}
                onChange={v => onUpdate({ logo: { ...section.logo, text: v || undefined } })}
                as="span"
                className={styles.logoText}
                placeholder="Logo"
              />
            )}
        </div>

        {/* Nav Items */}
        <div className={styles.nav}>
          {section.items.map((item, i) => (
            item.children && item.children.length > 0
              ? (
                <Dropdown
                  key={i}
                  item={item}
                  index={i}
                  isEditable={isEditable}
                  onUpdateItem={updateItem}
                  onRemoveItem={removeItem}
                  onAddChild={addChildItem}
                  onUpdateChild={updateChildItem}
                  onRemoveChild={removeChildItem}
                />
              )
              : isEditable
                ? (
                  <ItemPopover
                    key={i}
                    trigger={<span className={styles.navLink}>{item.label || "Link"}</span>}
                  >
                    <PopoverField label="Label">
                      <PopoverInput
                        value={item.label}
                        onChange={value => updateItem(i, { label: value })}
                        placeholder="Link text"
                      />
                    </PopoverField>
                    <PopoverField label="URL">
                      <PopoverInput
                        value={item.href}
                        onChange={value => updateItem(i, { href: value })}
                        placeholder="/page or https://..."
                        type="url"
                      />
                    </PopoverField>
                    <PopoverActions>
                      <PopoverButton onClick={() => addChildItem(i)}>
                        Add dropdown
                      </PopoverButton>
                      <PopoverButton variant="danger" onClick={() => removeItem(i)}>
                        Remove
                      </PopoverButton>
                    </PopoverActions>
                  </ItemPopover>
                )
                : (
                  <a key={i} href={item.href} className={styles.navLink}>{item.label}</a>
                )
          ))}
          {isEditable && (
            <button type="button" className={styles.addIcon} onClick={addItem} title="Add link">
              +
            </button>
          )}
        </div>

        {/* CTA Button */}
        {section.cta && (
          isEditable
            ? (
              <ItemPopover
                trigger={(
                  <span className={styles.cta}>{section.cta.text || "CTA"}</span>
                )}
              >
                <PopoverField label="Text">
                  <PopoverInput
                    value={section.cta.text}
                    onChange={value => updateCta({ text: value })}
                    placeholder="Get Started"
                  />
                </PopoverField>
                <PopoverField label="URL">
                  <PopoverInput
                    value={section.cta.href}
                    onChange={value => updateCta({ href: value })}
                    placeholder="/signup or https://..."
                    type="url"
                  />
                </PopoverField>
                <PopoverActions>
                  <PopoverButton variant="danger" onClick={() => onUpdate({ cta: undefined })}>
                    Remove CTA
                  </PopoverButton>
                </PopoverActions>
              </ItemPopover>
            )
            : (
              <a href={section.cta.href} className={styles.cta}>{section.cta.text}</a>
            )
        )}
        {!section.cta && isEditable && (
          <button
            type="button"
            className={styles.addCta}
            onClick={() => onUpdate({ cta: { text: "Get Started", href: "#" } })}
          >
            + CTA
          </button>
        )}
      </div>
    </nav>
  );
}
