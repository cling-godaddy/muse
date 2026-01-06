import { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        {/* Mobile hamburger */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={styles.drawerOverlay}
        data-open={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={styles.drawer} data-open={isMenuOpen}>
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            {section.logo?.image
              ? <img src={section.logo.image.url} alt={section.logo.image.alt} className={styles.logoImage} />
              : <span className={styles.logoText}>{section.logo?.text}</span>}
          </div>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className={styles.drawerNav}>
          {section.items.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={styles.drawerLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </nav>
  );
}
