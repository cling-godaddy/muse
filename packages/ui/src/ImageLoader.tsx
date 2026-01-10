import { useState } from "react";
import type { ImageSource } from "@muse/core";
import { Spinner } from "./Spinner";
import styles from "./ImageLoader.module.css";

interface Props {
  image?: ImageSource
  isPending: boolean
  aspectRatio?: string
  variant?: "rect" | "circle"
  className?: string
}

export function ImageLoader({
  image,
  isPending,
  aspectRatio,
  variant = "rect",
  className,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const containerStyle = aspectRatio ? { aspectRatio } : undefined;
  const showSpinner = isPending && !image;
  const showImage = !!image;
  const isCircle = variant === "circle";

  return (
    <div
      className={`${styles.container}${showSpinner ? ` ${styles.pending}` : ""}${isCircle ? ` ${styles.circle}` : ""}${className ? ` ${className}` : ""}`}
      style={containerStyle}
    >
      {showSpinner && (
        <div className={styles.spinnerWrapper}>
          <Spinner size="lg" />
        </div>
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
