import { useRef, useState, useCallback } from "react";
import type { GallerySection as GallerySectionType } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import styles from "./Carousel.module.css";

interface Props {
  block: GallerySectionType
  onUpdate: (data: Partial<GallerySectionType>) => void
  isPending?: boolean
}

export function Carousel({ block, onUpdate, isPending }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = block.images ?? [];
  const slideCount = isPending && images.length === 0
    ? getMinimumImages(block.preset ?? "gallery-carousel")
    : images.length;

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate current slide index
    const slide = track.querySelector(`.${styles.slide}`) as HTMLElement;
    if (slide) {
      const slideWidth = slide.offsetWidth;
      const gap = 16;
      const index = Math.round(scrollLeft / (slideWidth + gap));
      setCurrentIndex(Math.max(0, Math.min(index, slideCount - 1)));
    }
  }, [slideCount]);

  const scroll = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;

    const slideWidth = track.querySelector(`.${styles.slide}`)?.clientWidth ?? 0;
    const gap = 16;
    const scrollAmount = slideWidth + gap;

    track.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slideWidth = track.querySelector(`.${styles.slide}`)?.clientWidth ?? 0;
    const gap = 16;

    track.scrollTo({
      left: index * (slideWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <EditableText
          value={block.headline}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => scroll("prev")}
          disabled={!canScrollPrev}
          aria-label="Previous slide"
        >
          ←
        </button>
        <div
          ref={trackRef}
          className={styles.track}
          onScroll={updateScrollState}
        >
          {isPending && images.length === 0
            ? Array.from({
              length: getMinimumImages(block.preset ?? "gallery-carousel"),
            }).map((_, i) => (
              <div key={i} className={styles.slide}>
                <ImageLoader isPending />
              </div>
            ))
            : images.map((image, i) => (
              <div key={i} className={styles.slide}>
                <ImageLoader image={image} isPending={false} />
              </div>
            ))}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => scroll("next")}
          disabled={!canScrollNext}
          aria-label="Next slide"
        >
          →
        </button>
      </div>
      {slideCount > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
