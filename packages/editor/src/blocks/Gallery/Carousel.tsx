import { useRef, useState, useCallback } from "react";
import type { GalleryBlock as GalleryBlockType } from "@muse/core";
import { getMinimumImages } from "@muse/core";
import { useAutoResize } from "../../hooks";
import { ImageLoader } from "../../ux";
import styles from "./Carousel.module.css";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
  isPending?: boolean
}

export function Carousel({ block, onUpdate, isPending }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const images = block.images ?? [];

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;

    const slideWidth = track.querySelector(`.${styles.slide}`)?.clientWidth ?? 0;
    const gap = 16; // 1rem gap
    const scrollAmount = slideWidth + gap;

    track.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <textarea
          ref={headlineRef}
          className={styles.headline}
          rows={1}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
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
    </div>
  );
}
