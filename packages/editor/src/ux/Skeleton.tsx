import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: "text" | "rect" | "circle"
  className?: string
}

export function Skeleton({
  width,
  height,
  variant = "rect",
  className,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]}${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden="true"
    />
  );
}
