import { useState } from "react";
import type { NavItem } from "@muse/core";
import {
  ItemPopover,
  PopoverField,
  PopoverInput,
  PopoverActions,
  PopoverButton,
} from "../../controls/ItemPopover";
import styles from "./Navbar.module.css";

interface Props {
  item: NavItem
  index: number
  isEditable: boolean
  onUpdateItem: (index: number, data: Partial<NavItem>) => void
  onRemoveItem: (index: number) => void
  onAddChild: (parentIndex: number) => void
  onUpdateChild: (parentIndex: number, childIndex: number, data: Partial<NavItem>) => void
  onRemoveChild: (parentIndex: number, childIndex: number) => void
}

export function Dropdown({
  item,
  index,
  isEditable,
  onUpdateItem,
  onRemoveItem,
  onAddChild,
  onUpdateChild,
  onRemoveChild,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (isEditable) {
    return (
      <div
        className={styles.dropdown}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <ItemPopover
          trigger={(
            <span className={styles.navLink}>
              {item.label || "Link"}
              <span className={styles.dropdownArrow}>▾</span>
            </span>
          )}
        >
          <PopoverField label="Label">
            <PopoverInput
              value={item.label}
              onChange={value => onUpdateItem(index, { label: value })}
              placeholder="Link text"
            />
          </PopoverField>
          <PopoverField label="URL">
            <PopoverInput
              value={item.href}
              onChange={value => onUpdateItem(index, { href: value })}
              placeholder="/page or https://..."
              type="url"
            />
          </PopoverField>
          <PopoverActions>
            <PopoverButton onClick={() => onAddChild(index)}>
              Add sublink
            </PopoverButton>
            <PopoverButton variant="danger" onClick={() => onRemoveItem(index)}>
              Remove
            </PopoverButton>
          </PopoverActions>
        </ItemPopover>

        {isOpen && item.children && item.children.length > 0 && (
          <div className={styles.dropdownMenu}>
            {item.children.map((child, ci) => (
              <ItemPopover
                key={ci}
                trigger={(
                  <span className={styles.dropdownItem}>{child.label || "Sublink"}</span>
                )}
              >
                <PopoverField label="Label">
                  <PopoverInput
                    value={child.label}
                    onChange={value => onUpdateChild(index, ci, { label: value })}
                    placeholder="Link text"
                  />
                </PopoverField>
                <PopoverField label="URL">
                  <PopoverInput
                    value={child.href}
                    onChange={value => onUpdateChild(index, ci, { href: value })}
                    placeholder="/page or https://..."
                    type="url"
                  />
                </PopoverField>
                <PopoverActions>
                  <PopoverButton variant="danger" onClick={() => onRemoveChild(index, ci)}>
                    Remove
                  </PopoverButton>
                </PopoverActions>
              </ItemPopover>
            ))}
            <button
              type="button"
              className={styles.addSublink}
              onClick={() => onAddChild(index)}
            >
              + Add sublink
            </button>
          </div>
        )}
      </div>
    );
  }

  // View mode
  return (
    <div
      className={styles.dropdown}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <a href={item.href} className={styles.navLink}>
        {item.label}
        <span className={styles.dropdownArrow}>▾</span>
      </a>

      {isOpen && item.children && item.children.length > 0 && (
        <div className={styles.dropdownMenu}>
          {item.children.map((child, ci) => (
            <a key={ci} href={child.href} className={styles.dropdownItem}>
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
