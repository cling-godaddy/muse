import { useState } from "react";
import type { ImageSource } from "@muse/core";
import { Skeleton } from "./Skeleton";
import styles from "./ImageWithSkeleton.module.css";

interface Props {
  image?: ImageSource
  isPending: boolean
  aspectRatio?: string
  variant?: "rect" | "circle"
  className?: string
}

export function ImageWithSkeleton({
  image,
  isPending,
  aspectRatio,
  variant = "rect",
  className,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const containerStyle = aspectRatio ? { aspectRatio } : undefined;
  const showSkeleton = isPending && !image;
  const showImage = !!image;

  return (
    <div
      className={`${styles.container}${className ? ` ${className}` : ""}`}
      style={containerStyle}
    >
      {showSkeleton && (
        <Skeleton variant={variant} className={styles.skeleton} />
      )}
      {showImage && (
        <img
          src={image.url}
          alt={image.alt}
          className={`${styles.image}${loaded ? ` ${styles.loaded}` : ""}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
