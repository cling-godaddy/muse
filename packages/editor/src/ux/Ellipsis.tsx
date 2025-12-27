import styles from "./Ellipsis.module.css";

interface EllipsisProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Ellipsis({ size = "md", className }: EllipsisProps) {
  return (
    <span
      className={`${styles.ellipsis} ${styles[size]}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
