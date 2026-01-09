import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Menu.module.css";

export type MenuVariant = "list" | "cards" | "simple";

export interface MenuProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Menu items or categories - array of item/category elements */
  items: ReactNode
  /** Layout variant */
  variant?: MenuVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Menu section - pure layout component
 * For restaurant menus, service lists, etc.
 */
export function Menu({
  headline,
  subheadline,
  items,
  variant = "list",
  backgroundColor,
  className,
}: MenuProps) {
  const variantClass = variant === "cards"
    ? styles.cards
    : variant === "simple"
      ? styles.simple
      : styles.list;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      {subheadline && <div className={styles.subheadline}>{subheadline}</div>}
      <div className={styles.items}>{items}</div>
    </section>
  );
}

Menu.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  items: { type: "list", slot: "items", label: "Menu Items" },
} satisfies SectionSchema;

Menu.displayName = "Menu";
