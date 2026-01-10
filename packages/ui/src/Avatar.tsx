import type { ImageSource } from "@muse/core";
import { ImageLoader } from "./ImageLoader";
import styles from "./Avatar.module.css";

interface Props {
  image?: ImageSource
  name: string
  isPending?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ image, name, isPending, size = "md", className }: Props) {
  const showLoader = isPending || image;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`${styles.avatar} ${styles[size]}${className ? ` ${className}` : ""}`}>
      {showLoader
        ? <ImageLoader image={image} isPending={!!isPending && !image} variant="circle" />
        : initial}
    </div>
  );
}
