import type { ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Gallery.module.css";

export type GalleryVariant = "grid" | "masonry" | "carousel";

export interface GalleryProps {
  /** Headline slot */
  headline?: ReactNode
  /** Gallery images - array of image elements */
  images: ReactNode
  /** Layout variant */
  variant?: GalleryVariant
  /** Number of columns for grid/masonry */
  columns?: 2 | 3 | 4
  /** Background color */
  backgroundColor?: string
  /** Additional class name */
  className?: string
}

/**
 * Gallery section - pure layout component
 */
export function Gallery({
  headline,
  images,
  variant = "grid",
  columns = 3,
  backgroundColor,
  className,
}: GalleryProps) {
  const variantClass = variant === "masonry"
    ? styles.masonry
    : variant === "carousel"
      ? styles.carousel
      : styles.grid;

  return (
    <section
      className={`${styles.section} ${variantClass} ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      {headline && <div className={styles.headline}>{headline}</div>}
      <div
        className={styles.images}
        style={{ "--columns": columns } as React.CSSProperties}
      >
        {images}
      </div>
    </section>
  );
}

Gallery.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  images: { type: "list", slot: "images", label: "Images" },
} satisfies SectionSchema;

Gallery.displayName = "Gallery";
