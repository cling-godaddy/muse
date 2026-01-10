import React, { useState, useRef, useEffect, type ReactNode } from "react";
import type { SectionSchema } from "./schema";
import styles from "./Gallery.module.css";
import { wrapChildren } from "./utils";

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
 * Gallery section - layout component with carousel interactivity
 */
export function Gallery({
  headline,
  images,
  variant = "grid",
  columns = 3,
  backgroundColor,
  className,
}: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemCount = React.Children.count(images);

  // For carousel: handle scroll to detect current slide
  useEffect(() => {
    if (variant !== "carousel" || !trackRef.current) return;

    const track = trackRef.current;
    const handleScroll = () => {
      const children = track.children;
      if (children.length === 0) return;

      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childRect = child.getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(childCenter - trackCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      setCurrentIndex(closestIndex);
    };

    track.addEventListener("scroll", handleScroll);
    return () => track.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // Scroll to specific slide
  const scrollToIndex = (index: number) => {
    if (!trackRef.current) return;
    const children = trackRef.current.children;
    if (index < 0 || index >= children.length) return;

    const child = children[index] as HTMLElement;
    const track = trackRef.current;
    const trackRect = track.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();

    const scrollLeft = track.scrollLeft + (childRect.left - trackRect.left)
      - (trackRect.width / 2) + (childRect.width / 2);

    track.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  const handlePrev = () => {
    scrollToIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    scrollToIndex(Math.min(itemCount - 1, currentIndex + 1));
  };

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
      {variant === "carousel"
        ? (
          <>
            <div className={styles.carouselWrapper}>
              {itemCount > 1 && (
                <button
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous slide"
                >
                  ←
                </button>
              )}
              <div
                ref={trackRef}
                className={styles.images}
                style={{ "--columns": columns } as React.CSSProperties}
              >
                {wrapChildren(images, styles.item)}
              </div>
              {itemCount > 1 && (
                <button
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={handleNext}
                  disabled={currentIndex === itemCount - 1}
                  aria-label="Next slide"
                >
                  →
                </button>
              )}
            </div>
            {itemCount > 1 && (
              <div className={styles.dots}>
                {Array.from({ length: itemCount }).map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
                    onClick={() => scrollToIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )
        : (
          <div
            ref={trackRef}
            className={styles.images}
            style={{ "--columns": columns } as React.CSSProperties}
          >
            {wrapChildren(images, styles.item)}
          </div>
        )}
    </section>
  );
}

Gallery.schema = {
  headline: { type: "rich-text", slot: "headline", label: "Headline", optional: true },
  images: { type: "list", slot: "images", label: "Images" },
} satisfies SectionSchema;

Gallery.displayName = "Gallery";
