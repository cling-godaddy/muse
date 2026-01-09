import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Products.module.css";

export type ProductsVariant = "grid" | "carousel";

export interface ProductsProps {
  /** Headline slot */
  headline?: ReactNode
  /** Subheadline slot */
  subheadline?: ReactNode
  /** Product cards - array of product elements */
  items: ReactNode
  /** Layout variant */
  variant?: ProductsVariant
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Products section - pure layout component
 * For e-commerce product grids/carousels
 */
export function Products({
  headline,
  subheadline,
  items,
  variant = "grid",
  backgroundColor,
  className,
}: ProductsProps) {
  const variantClass = variant === "carousel" ? styles.carousel : styles.grid;

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

Products.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  subheadline: { type: "text", slot: "subheadline", label: "Subheadline", optional: true },
  items: { type: "list", slot: "items", label: "Products" },
} satisfies SectionSchema;

Products.displayName = "Products";
